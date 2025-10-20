import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { Control, StoryBotQuestion, FullAssessment, Checklist } from "@shared/iso";

// Load data files
const loadControls = (): Control[] => {
  const filePath = path.join(__dirname, "../data/iso-controls.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.controls;
};

const loadStoryBotQuestions = (): StoryBotQuestion[] => {
  const filePath = path.join(__dirname, "../data/story-bot-questions.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.questions;
};

// Get all controls
export const getControls: RequestHandler = (req, res) => {
  try {
    const controls = loadControls();
    res.json({ controls });
  } catch (error) {
    res.status(500).json({ error: "Failed to load controls" });
  }
};

// Get story bot questions
export const getStoryBotQuestions: RequestHandler = (req, res) => {
  try {
    const questions = loadStoryBotQuestions();
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: "Failed to load questions" });
  }
};

// Save assessment
export const saveAssessment: RequestHandler = (req, res) => {
  try {
    const { type, data } = req.body;
    
    // In production, save to database
    // For now, just return success
    res.json({ 
      success: true, 
      message: "Assessment saved successfully",
      type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to save assessment" });
  }
};

// Load assessment
export const loadAssessment: RequestHandler = (req, res) => {
  try {
    const { type } = req.query;
    
    // In production, load from database
    // For now, return empty assessment
    res.json({ 
      success: true, 
      type,
      data: null,
      message: "No saved assessment found"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load assessment" });
  }
};

// Export assessment
export const exportAssessment: RequestHandler = (req, res) => {
  try {
    const { type, data } = req.body;
    
    // Generate export data
    const exportData = {
      type,
      data,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };
    
    res.json({ 
      success: true, 
      data: exportData
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to export assessment" });
  }
};

// Send checklist via email (placeholder)
export const sendChecklist: RequestHandler = (req, res) => {
  try {
    const { email, checklist } = req.body;
    
    // In production, send email via SMTP
    // For now, just return success
    res.json({ 
      success: true, 
      message: `Checklist would be sent to ${email}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to send checklist" });
  }
};

