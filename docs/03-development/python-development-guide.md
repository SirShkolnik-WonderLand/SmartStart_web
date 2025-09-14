# 🐍 Python Development Guide - SmartStart Platform

## 📚 Overview

This guide provides comprehensive instructions for developing, testing, and maintaining the Python Brain services in the SmartStart Platform. The Python Brain is the main intelligence engine, handling all business logic, AI processing, and advanced features.

**🎯 Current Status: Python Brain V3.1.0 - Complete Intelligence Platform**
- **Total Services:** 12 Python services with full functionality
- **Total Endpoints:** 50+ API endpoints across all services
- **Architecture:** Microservices with Flask and real-time capabilities
- **Development:** Python 3.13+ with modern development practices

---

## 🛠️ Development Environment Setup

### **Prerequisites**
- **Python 3.13+** (Required)
- **Node.js 18+** (For proxy server)
- **PostgreSQL** (Database)
- **Git** (Version control)
- **VS Code** (Recommended IDE)

### **Python Installation**

#### **macOS (using Homebrew)**
```bash
# Install Python 3.13
brew install python@3.13

# Verify installation
python3.13 --version
```

#### **Ubuntu/Debian**
```bash
# Add deadsnakes PPA
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update

# Install Python 3.13
sudo apt install python3.13 python3.13-venv python3.13-pip

# Verify installation
python3.13 --version
```

#### **Windows**
```bash
# Download from python.org
# Install Python 3.13
# Add to PATH during installation

# Verify installation
python --version
```

---

## 🚀 Project Setup

### **1. Clone Repository**
```bash
git clone <repository-url>
cd SmartStart
```

### **2. Create Virtual Environment**
```bash
# Create virtual environment
python3.13 -m venv python-services/venv

# Activate virtual environment
# macOS/Linux:
source python-services/venv/bin/activate

# Windows:
python-services\venv\Scripts\activate
```

### **3. Install Dependencies**
```bash
# Navigate to python-services
cd python-services

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

### **4. Environment Configuration**
```bash
# Copy environment template
cp ../env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smartstart

# Python Brain
PYTHON_BRAIN_URL=http://localhost:5000
NODEJS_API_URL=http://localhost:3000

# JWT
JWT_SECRET=your-secret-key

# WebSocket
WEBSOCKET_PORT=8765
```

---

## 🏗️ Project Structure

### **Python Services Directory**
```
python-services/
├── brain/                    # Main Flask application
│   └── main.py              # Python Brain orchestrator
├── services/                # Business logic services
│   ├── user_service.py      # User management
│   ├── legal_service.py     # Legal document processing
│   ├── venture_service.py   # Venture management
│   ├── gamification_service.py # Gamification system
│   ├── buz_token_service.py # BUZ token economy
│   ├── umbrella_service.py  # Relationship management
│   ├── authentication_service.py # Authentication
│   ├── file_service.py      # File management
│   ├── analytics_service.py # Analytics & reporting
│   ├── notification_service.py # Notifications
│   ├── websocket_service.py # Real-time communication
│   ├── state_machine_service.py # Workflow automation
│   └── nodejs_connector.py  # Database integration
├── requirements.txt         # Python dependencies
├── start.py                # Startup script
├── venv/                   # Virtual environment
└── .env                    # Environment variables
```

---

## 🔧 Development Workflow

### **1. Starting Development Server**

#### **Terminal 1: Python Brain**
```bash
cd python-services
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

python brain/main.py
```

#### **Terminal 2: Node.js Proxy**
```bash
# In project root
npm start
```

#### **Terminal 3: Frontend (Optional)**
```bash
cd frontend
npm run dev
```

### **2. Development URLs**
- **Python Brain:** http://localhost:5000
- **Node.js Proxy:** http://localhost:3000
- **Frontend:** http://localhost:3001

### **3. Health Checks**
```bash
# Python Brain health
curl http://localhost:5000/api/health

# Node.js Proxy health
curl http://localhost:3000/health

# Test proxy to Python Brain
curl http://localhost:3000/api/health
```

---

## 🧪 Testing

### **1. Unit Testing**
```bash
# Run all tests
python -m pytest tests/

# Run specific test file
python -m pytest tests/test_user_service.py

# Run with coverage
python -m pytest --cov=services tests/
```

### **2. API Testing**
```bash
# Test Python Brain endpoints
curl -X GET http://localhost:5000/api/users/
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### **3. Integration Testing**
```bash
# Test proxy integration
curl -X GET http://localhost:3000/api/users/
curl -X GET http://localhost:3000/api/health
```

---

## 🔨 Service Development

### **1. Creating a New Service**

#### **Step 1: Create Service File**
```python
# services/new_service.py
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class NewService:
    def __init__(self, nodejs_connector=None):
        self.nodejs_connector = nodejs_connector
        logger.info("🆕 New Service initialized")
    
    def get_items(self) -> Dict[str, Any]:
        """Get all items"""
        try:
            # Business logic here
            return {
                "success": True,
                "data": [],
                "message": "Items retrieved successfully"
            }
        except Exception as e:
            logger.error(f"Error getting items: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def create_item(self, item_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new item"""
        try:
            # Validation
            if not item_data.get('name'):
                return {
                    "success": False,
                    "error": "Name is required"
                }
            
            # Business logic here
            return {
                "success": True,
                "data": item_data,
                "message": "Item created successfully"
            }
        except Exception as e:
            logger.error(f"Error creating item: {e}")
            return {
                "success": False,
                "error": str(e)
            }
```

#### **Step 2: Add to Main Application**
```python
# brain/main.py
from services.new_service import NewService

# Initialize service
new_service = NewService(nodejs_connector)

# Add routes
@app.route('/api/new-items/', methods=['GET'])
def get_new_items():
    return new_service.get_items()

@app.route('/api/new-items/', methods=['POST'])
def create_new_item():
    data = request.get_json()
    return new_service.create_item(data)
```

### **2. Service Patterns**

#### **Standard Service Structure**
```python
class ServiceName:
    def __init__(self, nodejs_connector=None):
        self.nodejs_connector = nodejs_connector
        logger.info("🔧 Service initialized")
    
    def method_name(self, param1: str, param2: Optional[int] = None) -> Dict[str, Any]:
        """Method description"""
        try:
            # Input validation
            if not param1:
                return {"success": False, "error": "param1 is required"}
            
            # Business logic
            result = self.process_data(param1, param2)
            
            # Return success response
            return {
                "success": True,
                "data": result,
                "message": "Operation completed successfully"
            }
        except Exception as e:
            logger.error(f"Error in method_name: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def process_data(self, param1: str, param2: Optional[int]) -> Any:
        """Helper method for business logic"""
        # Implementation here
        pass
```

#### **Error Handling Pattern**
```python
def handle_error(self, operation: str, error: Exception) -> Dict[str, Any]:
    """Standard error handling"""
    logger.error(f"Error in {operation}: {error}")
    return {
        "success": False,
        "error": str(error),
        "operation": operation
    }
```

---

## 🔌 Database Integration

### **1. Using Node.js Connector**
```python
from nodejs_connector import NodeJSConnector

class MyService:
    def __init__(self):
        self.nodejs_connector = NodeJSConnector()
    
    def get_data(self):
        # Use connector for database operations
        return self.nodejs_connector.get_users()
    
    def create_data(self, data):
        return self.nodejs_connector.create_user(data)
```

### **2. Database Operations**
```python
# Get data
users = self.nodejs_connector.get_users()
user = self.nodejs_connector.get_user_by_id(user_id)

# Create data
new_user = self.nodejs_connector.create_user(user_data)

# Update data
updated_user = self.nodejs_connector.update_user(user_id, user_data)

# Delete data
self.nodejs_connector.delete_user(user_id)
```

---

## 🔌 WebSocket Development

### **1. WebSocket Service**
```python
# services/websocket_service.py
import asyncio
import websockets
import json

class WebSocketService:
    def __init__(self):
        self.connections = {}
    
    async def start_server(self):
        """Start WebSocket server"""
        async with websockets.serve(self.handle_connection, "localhost", 8765):
            await asyncio.Future()
    
    async def handle_connection(self, websocket, path):
        """Handle new WebSocket connection"""
        self.connections[websocket] = path
        try:
            async for message in websocket:
                await self.process_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.connections.pop(websocket, None)
    
    async def process_message(self, websocket, message):
        """Process incoming WebSocket message"""
        try:
            data = json.loads(message)
            # Process message based on type
            if data.get('type') == 'ping':
                await websocket.send(json.dumps({'type': 'pong'}))
        except json.JSONDecodeError:
            await websocket.send(json.dumps({'error': 'Invalid JSON'}))
```

### **2. WebSocket Testing**
```javascript
// Test WebSocket connection
const ws = new WebSocket('ws://localhost:8765');

ws.onopen = () => {
    console.log('Connected to WebSocket');
    ws.send(JSON.stringify({type: 'ping'}));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};
```

---

## 🤖 State Machine Development

### **1. State Machine Service**
```python
# services/state_machine_service.py
class StateMachineService:
    def __init__(self):
        self.machines = {}
    
    def create_state_machine(self, machine_type: str, instance_id: str) -> Dict[str, Any]:
        """Create new state machine"""
        try:
            machine = {
                'type': machine_type,
                'instance_id': instance_id,
                'current_state': 'initial',
                'history': [],
                'created_at': datetime.now().isoformat()
            }
            self.machines[f"{machine_type}:{instance_id}"] = machine
            return {
                "success": True,
                "data": machine,
                "message": "State machine created successfully"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def send_event(self, machine_type: str, instance_id: str, event: str) -> Dict[str, Any]:
        """Send event to state machine"""
        try:
            key = f"{machine_type}:{instance_id}"
            if key not in self.machines:
                return {"success": False, "error": "State machine not found"}
            
            machine = self.machines[key]
            # Process event and transition state
            new_state = self.process_event(machine, event)
            machine['current_state'] = new_state
            machine['history'].append({
                'event': event,
                'new_state': new_state,
                'timestamp': datetime.now().isoformat()
            })
            
            return {
                "success": True,
                "data": machine,
                "message": "Event processed successfully"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
```

---

## 🔒 Security Development

### **1. Authentication Middleware**
```python
from functools import wraps
import jwt

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return {'success': False, 'error': 'Token missing'}, 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data['user_id']
        except jwt.ExpiredSignatureError:
            return {'success': False, 'error': 'Token expired'}, 401
        except jwt.InvalidTokenError:
            return {'success': False, 'error': 'Invalid token'}, 401
        
        return f(current_user, *args, **kwargs)
    return decorated_function
```

### **2. Input Validation**
```python
def validate_user_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate user input data"""
    errors = []
    
    if not data.get('email'):
        errors.append('Email is required')
    elif '@' not in data['email']:
        errors.append('Invalid email format')
    
    if not data.get('password'):
        errors.append('Password is required')
    elif len(data['password']) < 8:
        errors.append('Password must be at least 8 characters')
    
    if errors:
        return {"success": False, "errors": errors}
    
    return {"success": True}
```

---

## 📊 Logging & Debugging

### **1. Logging Configuration**
```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('python-brain.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
```

### **2. Debugging Tips**
```python
# Use logger for debugging
logger.info(f"Processing request: {request_data}")
logger.debug(f"Service state: {self.state}")
logger.error(f"Error occurred: {error}")

# Use print for quick debugging (remove in production)
print(f"Debug: {variable_name}")

# Use breakpoints in VS Code
# Set breakpoint and run with debugger
```

---

## 🚀 Deployment

### **1. Local Testing**
```bash
# Test Python Brain locally
cd python-services
python brain/main.py

# Test with proxy
npm start
```

### **2. Production Deployment**
```bash
# Deploy to Render
git add .
git commit -m "Update Python Brain"
git push origin main

# Monitor deployment
# Check Render dashboard for deployment status
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### **1. Import Errors**
```bash
# Error: ModuleNotFoundError
# Solution: Check virtual environment activation
source python-services/venv/bin/activate
pip install -r requirements.txt
```

#### **2. Port Conflicts**
```bash
# Error: Port already in use
# Solution: Kill process using port
lsof -ti:5000 | xargs kill -9
```

#### **3. Database Connection Issues**
```bash
# Error: Database connection failed
# Solution: Check DATABASE_URL in .env
# Ensure PostgreSQL is running
```

#### **4. WebSocket Issues**
```bash
# Error: WebSocket connection failed
# Solution: Check WebSocket port configuration
# Ensure WebSocket service is running
```

---

## 📚 Additional Resources

### **Documentation**
- **Python Brain API Reference** - Complete API documentation
- **Python Brain Architecture** - System architecture guide
- **Service Development** - Individual service guides

### **Tools**
- **VS Code Python Extension** - Recommended IDE
- **Postman** - API testing
- **pgAdmin** - Database management

### **Learning Resources**
- **Flask Documentation** - https://flask.palletsprojects.com/
- **Python WebSocket** - https://websockets.readthedocs.io/
- **JWT Authentication** - https://jwt.io/

---

**This Python development guide provides everything you need to develop, test, and maintain the Python Brain services in the SmartStart Platform!** 🐍🚀
