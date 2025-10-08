"""
SMB Cyber Health Check - Unified FastAPI Application
Single server deployment with frontend serving and API endpoints
"""

import os
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, Form, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import uvicorn

# Security imports
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import secrets
import hashlib

# Database
import sqlite3
from contextlib import asynccontextmanager

# PDF Generation
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

# Configuration
class Settings:
    DATABASE_URL: str = "sqlite:///./smb_health_check.db"
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    MAX_ASSESSMENTS_PER_IP: int = 10
    RATE_LIMIT_WINDOW: int = 3600  # 1 hour
    
    # Security headers
    SECURITY_HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self';"
    }

settings = Settings()

# Security
security = HTTPBearer(auto_error=False)

# Database setup
def init_db():
    """Initialize SQLite database with security measures"""
    conn = sqlite3.connect("smb_health_check.db")
    cursor = conn.cursor()
    
    # Enable WAL mode for better concurrency
    cursor.execute("PRAGMA journal_mode=WAL")
    
    # Enable foreign key constraints
    cursor.execute("PRAGMA foreign_keys=ON")
    
    # Create assessments table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            ip_address TEXT NOT NULL,
            user_agent TEXT,
            mode TEXT NOT NULL,
            answers TEXT NOT NULL,
            score INTEGER NOT NULL,
            tier TEXT NOT NULL,
            email TEXT,
            company TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            is_processed BOOLEAN DEFAULT FALSE
        )
    """)
    
    # Create rate limiting table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rate_limits (
            ip_address TEXT PRIMARY KEY,
            count INTEGER DEFAULT 1,
            window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_request TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create indexes for performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessments_ip ON assessments(ip_address)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessments_created ON assessments(created_at)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessments_expires ON assessments(expires_at)")
    
    conn.commit()
    conn.close()

# Rate limiting
async def check_rate_limit(ip_address: str) -> bool:
    """Check if IP is within rate limits"""
    conn = sqlite3.connect("smb_health_check.db")
    cursor = conn.cursor()
    
    # Clean old records
    cursor.execute("""
        DELETE FROM rate_limits 
        WHERE datetime('now') > datetime(window_start, '+1 hour')
    """)
    
    # Check current count
    cursor.execute("""
        SELECT count FROM rate_limits 
        WHERE ip_address = ? AND datetime('now') <= datetime(window_start, '+1 hour')
    """, (ip_address,))
    
    result = cursor.fetchone()
    
    if result is None:
        # First request in window
        cursor.execute("""
            INSERT OR REPLACE INTO rate_limits (ip_address, count, window_start, last_request)
            VALUES (?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """, (ip_address,))
        allowed = True
    elif result[0] < settings.MAX_ASSESSMENTS_PER_IP:
        # Within limits
        cursor.execute("""
            UPDATE rate_limits 
            SET count = count + 1, last_request = CURRENT_TIMESTAMP
            WHERE ip_address = ?
        """, (ip_address,))
        allowed = True
    else:
        # Rate limited
        allowed = False
    
    conn.commit()
    conn.close()
    return allowed

# Application lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown - cleanup if needed
    pass

# FastAPI app
app = FastAPI(
    title="SMB Cyber Health Check",
    description="Free cyber security assessment for Ontario & GTA small businesses",
    version="1.0.0",
    lifespan=lifespan
)

# Security middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    for header, value in settings.SECURITY_HEADERS.items():
        response.headers[header] = value
    return response

# Serve static files (frontend build)
app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
app.mount("/static", StaticFiles(directory="dist"), name="static")

# Pydantic models
class AssessmentRequest(BaseModel):
    mode: str
    answers: List[int]
    email: Optional[EmailStr] = None
    company: Optional[str] = None

class AssessmentResponse(BaseModel):
    session_id: str
    score: int
    tier: str
    top_fixes: List[Dict[str, Any]]
    compliance_hints: List[Dict[str, Any]]

# Routes
@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    """Serve the main frontend application"""
    try:
        with open("dist/index.html", "r") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(content="Frontend not built. Run 'npm run build' first.", status_code=404)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/assess")
async def assess_security(
    request: AssessmentRequest,
    client_request: Request
):
    """Submit assessment and get results"""
    
    # Get client IP
    ip_address = client_request.client.host
    user_agent = client_request.headers.get("user-agent", "")
    
    # Rate limiting
    if not await check_rate_limit(ip_address):
        raise HTTPException(
            status_code=429, 
            detail="Too many requests. Please try again later."
        )
    
    # Validate input
    if not request.mode or not request.answers:
        raise HTTPException(status_code=400, detail="Invalid assessment data")
    
    if len(request.answers) != 12:
        raise HTTPException(status_code=400, detail="Must answer all 12 questions")
    
    # Generate session ID
    session_id = secrets.token_urlsafe(16)
    
    # Calculate score (simplified - you can implement full logic)
    total_score = sum(request.answers)
    
    # Determine tier
    if total_score <= 8:
        tier = "At Risk"
    elif total_score <= 16:
        tier = "Improving"
    else:
        tier = "Strong"
    
    # Store assessment
    conn = sqlite3.connect("smb_health_check.db")
    cursor = conn.cursor()
    
    expires_at = datetime.utcnow() + timedelta(days=90)
    
    cursor.execute("""
        INSERT INTO assessments 
        (session_id, ip_address, user_agent, mode, answers, score, tier, email, company, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        session_id, ip_address, user_agent, request.mode, 
        json.dumps(request.answers), total_score, tier,
        request.email, request.company, expires_at
    ))
    
    conn.commit()
    conn.close()
    
    # Return results (simplified)
    return AssessmentResponse(
        session_id=session_id,
        score=total_score,
        tier=tier,
        top_fixes=[
            {"title": "Implement MFA", "priority": 1},
            {"title": "Update Software", "priority": 2},
            {"title": "Backup Strategy", "priority": 3}
        ],
        compliance_hints=[
            {"framework": "PIPEDA", "relevant": True},
            {"framework": "ISO 27001", "relevant": True}
        ]
    )

@app.get("/api/report/{session_id}")
async def generate_report(session_id: str):
    """Generate PDF report for session"""
    
    # Get assessment data
    conn = sqlite3.connect("smb_health_check.db")
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT mode, answers, score, tier, email, company, created_at
        FROM assessments 
        WHERE session_id = ? AND datetime('now') < expires_at
    """, (session_id,))
    
    result = cursor.fetchone()
    conn.close()
    
    if not result:
        raise HTTPException(status_code=404, detail="Report not found or expired")
    
    # Generate PDF (simplified)
    html_content = f"""
    <html>
    <head>
        <title>SMB Cyber Health Report</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .score {{ font-size: 48px; font-weight: bold; color: #7b61ff; }}
            .tier {{ font-size: 24px; margin-top: 10px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>SMB Cyber Health Report</h1>
            <div class="score">{result[2]}</div>
            <div class="tier">{result[3]}</div>
        </div>
        <p>Generated on: {result[6]}</p>
        <p>Assessment Mode: {result[0]}</p>
    </body>
    </html>
    """
    
    # Generate PDF
    font_config = FontConfiguration()
    html_doc = HTML(string=html_content)
    css_doc = CSS(string="", font_config=font_config)
    
    pdf_bytes = html_doc.write_pdf(stylesheets=[css_doc])
    
    return JSONResponse(
        content={"pdf_base64": pdf_bytes.hex()},
        headers={"Content-Type": "application/json"}
    )

@app.get("/api/stats")
async def get_stats():
    """Get basic statistics (admin endpoint)"""
    conn = sqlite3.connect("smb_health_check.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM assessments WHERE datetime('now') < expires_at")
    total_assessments = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(score) FROM assessments WHERE datetime('now') < expires_at")
    avg_score = cursor.fetchone()[0] or 0
    
    conn.close()
    
    return {
        "total_assessments": total_assessments,
        "average_score": round(avg_score, 1),
        "timestamp": datetime.utcnow().isoformat()
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=False,  # Set to False for production
        log_level="info"
    )
