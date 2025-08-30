import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import meshRoutes from "./routes/mesh.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import ideaRoutes from "./routes/ideas.js";
import pollRoutes from "./routes/polls.js";
import messageRoutes from "./routes/messages.js";
import usersRoutes from "./routes/users.js";
import { authenticateToken, requireRole } from "./middleware/auth.js";
import contributionsRoutes from "./routes/contributions.js";
import sprintsRoutes from "./routes/sprints.js";
import tasksRoutes from "./routes/tasks.js";
import capTableRoutes from "./routes/capTable.js";
import visibilityRoutes from "./routes/visibility.js";
import smartContractRoutes from "./routes/smartContracts.js";
// import smartDataRoutes from "./routes/smartData.js";

const prisma = new PrismaClient();
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - Simplified and more robust
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://smartstart-web.onrender.com",
    "https://smartstart-web.onrender.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'https://smartstart-web.onrender.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.status(200).end();
});

app.use(express.json());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later"
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Version endpoint
app.get('/version', (_req, res) => {
  res.json({ name: 'smartstart-api', version: process.env.COMMIT_SHA || 'dev' });
});

// Register modular API routes
app.use('/auth', authRoutes);
app.use(apiLimiter);
app.use('/projects', projectRoutes);
app.use('/ideas', ideaRoutes);
app.use('/polls', pollRoutes);
app.use('/messages', messageRoutes);
app.use('/users', usersRoutes);
app.use('/', sprintsRoutes);
app.use('/', tasksRoutes);
app.use('/', contributionsRoutes);
app.use('/', capTableRoutes);
app.use('/', visibilityRoutes);
app.use('/mesh', meshRoutes);
app.use('/admin', adminRoutes);
app.use('/smart-contracts', smartContractRoutes);

// Smart Data Routes - New interconnected data intelligence endpoints
// Temporarily disabled due to compilation issues
// app.use('/portfolio', smartDataRoutes);
// app.use('/community', smartDataRoutes);
// app.use('/notifications', smartDataRoutes);
// app.use('/data', smartDataRoutes);
// app.use('/activity', smartDataRoutes);
// app.use('/insights', smartDataRoutes);
// app.use('/team', smartDataRoutes);
// app.use('/updates', smartDataRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API running on port ${port}`));
