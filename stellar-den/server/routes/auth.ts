import { RequestHandler } from "express";
import {
  initializeTOTP,
  verifyTOTP,
  confirmSecretBackup,
  findUserByEmail,
  getUser,
  saveUserAssessmentData,
  getUserAssessmentData,
  createAuthSession,
  verifySession,
} from "../services/authService.js";

// Initialize TOTP for new user
export const initTOTP: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await initializeTOTP(email);
    res.json({
      success: true,
      secret: result.secret,
      qrCodeUrl: result.qrCodeUrl,
      userId: result.userId,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to initialize TOTP" });
  }
};

// Verify TOTP code
export const verifyCode: RequestHandler = (req, res) => {
  try {
    const { userId, token } = req.body;
    
    if (!userId || !token) {
      return res.status(400).json({ error: "UserId and token are required" });
    }

    const user = getUser(userId);
    if (!user) {
      console.error(`[AUTH] User not found: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.secret) {
      console.error(`[AUTH] No secret found for user: ${userId}`);
      return res.status(400).json({ error: "User has no authentication secret. Please set up 2FA again." });
    }

    console.log(`[AUTH] Verifying code for user: ${user.email} (${userId})`);
    const verified = verifyTOTP(userId, token);
    
    if (!verified) {
      console.error(`[AUTH] Verification failed for user: ${user.email}`);
      return res.status(401).json({ 
        error: "Invalid verification code. Please check your authenticator app and try again.",
        hint: "Make sure the code matches the one in your authenticator app. Codes expire every 30 seconds."
      });
    }

    console.log(`[AUTH] Verification successful for user: ${user.email}`);
    const session = createAuthSession(userId, user.email);
    
    res.json({
      success: true,
      session,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error(`[AUTH] Error verifying code:`, error);
    res.status(500).json({ error: error.message || "Failed to verify code" });
  }
};

// Confirm secret backup
export const confirmBackup: RequestHandler = (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    confirmSecretBackup(userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to confirm backup" });
  }
};

// Check if user exists
export const checkUser: RequestHandler = (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = findUserByEmail(email);
    
    if (user) {
      res.json({
        exists: true,
        userId: user.id,
        secretBackedUp: user.secretBackedUp || false,
        hasSecret: !!user.secret,
      });
    } else {
      res.json({ exists: false });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to check user" });
  }
};

// Get user info
export const getUserInfo: RequestHandler = (req, res) => {
  try {
    const { userId, session } = req.body;
    
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "UserId is required" });
    }

    // Verify session
    if (!session || !verifySession(session)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to get user info" });
  }
};

// Save assessment data
export const saveAssessmentData: RequestHandler = (req, res) => {
  try {
    const { userId, data } = req.body;
    const session = req.body.session as any;
    
    if (!userId || !data) {
      return res.status(400).json({ error: "UserId and data are required" });
    }

    // Verify session
    if (!session || !verifySession(session)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    saveUserAssessmentData(userId, data);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save data" });
  }
};

// Load assessment data
export const loadAssessmentData: RequestHandler = (req, res) => {
  try {
    const { userId, session } = req.body;
    
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "UserId is required" });
    }

    // Verify session
    if (!session || !verifySession(session)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const data = getUserAssessmentData(userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load data" });
  }
};
