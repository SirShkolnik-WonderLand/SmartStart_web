import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Control, StoryBotQuestion, Checklist } from "@shared/iso";

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Send checklist via email
export const sendChecklist: RequestHandler = async (req, res) => {
  try {
    const { email, controls } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Import email service
    const { emailService } = await import('../services/emailService.js');
    
    // Generate checklist JSON
    const checklist = {
      framework: "ISO 27001:2022",
      controls: controls || [],
      generatedAt: new Date().toISOString()
    };

    const checklistJson = JSON.stringify(checklist, null, 2);

    // Send checklist to user
    const userEmailHtml = `
      <h2>Your ISO 27001 Checklist</h2>
      <p>Hi there,</p>
      <p>Thank you for using ISO Studio! Your personalized ISO 27001 checklist is attached.</p>
      <p><strong>What's next?</strong></p>
      <ul>
        <li>Review your checklist</li>
        <li>Work through each control</li>
        <li>Need help? Contact us at <a href="mailto:udi.shkolnik@alicesolutionsgroup.com">udi.shkolnik@alicesolutionsgroup.com</a></li>
      </ul>
      <hr />
      <p><strong>Checklist Details:</strong></p>
      <pre style="background: #f4f5f7; padding: 15px; border-radius: 5px; overflow-x: auto;">${checklistJson}</pre>
      <hr />
      <p>Best regards,<br/>
      AliceSolutions Group<br/>
      <a href="https://alicesolutionsgroup.com">alicesolutionsgroup.com</a></p>
    `;

    await emailService.sendEmail({
      to: email,
      subject: 'Your ISO 27001 Checklist - AliceSolutions Group',
      html: userEmailHtml,
    });

    // Send notification to admin
    await emailService.sendEmail({
      to: 'udi.shkolnik@alicesolutionsgroup.com',
      subject: `ISO Studio: Checklist Requested by ${email}`,
      html: `
        <h2>ISO Studio Checklist Request</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Controls:</strong> ${controls?.length || 0} controls</p>
        <p><strong>Requested at:</strong> ${new Date().toISOString()}</p>
        <hr />
        <p>Potential lead from ISO Studio!</p>
      `,
    });

    res.json({ 
      success: true, 
      message: `Checklist sent to ${email}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to send checklist:', error);
    res.status(500).json({ error: "Failed to send checklist" });
  }
};

// Send QuickBot assessment report via email
export const sendQuickBotReport: RequestHandler = async (req, res) => {
  try {
    const { email, assessmentData } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Import email service
    const { emailService } = await import('../services/emailService.js');
    
    const { percentage, readinessLevel, recommendations, questions } = assessmentData || {};
    
    // Generate report HTML
    const reportHtml = `
      <h2>Your Security Assessment Report</h2>
      <p>Hi there,</p>
      <p>Thank you for completing the ISO Studio QuickBot assessment! Here's your personalized security report.</p>
      
      <div style="background: #f4f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Overall Security Readiness</h3>
        <p style="font-size: 24px; font-weight: bold; color: #2f5aae;">
          ${percentage || 0}% - ${readinessLevel || 'Medium'}
        </p>
      </div>

      <h3>Key Recommendations</h3>
      <ul>
        ${(recommendations || []).map((rec: string) => `<li>${rec}</li>`).join('')}
      </ul>

      ${questions && questions.length > 0 ? `
      <h3>Assessment Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #2f5aae; color: white;">
            <th style="padding: 10px; text-align: left;">Question</th>
            <th style="padding: 10px; text-align: center;">Score</th>
          </tr>
        </thead>
        <tbody>
          ${questions.map((q: any, idx: number) => `
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px;">${q.question || `Question ${idx + 1}`}</td>
              <td style="padding: 10px; text-align: center;">${q.score || 0}/7</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}

      <hr />
      <p><strong>What's next?</strong></p>
      <ul>
        <li>Review your assessment results</li>
        <li>Focus on the recommendations above</li>
        <li>Consider a full ISO 27001 assessment</li>
        <li>Need help? Contact us at <a href="mailto:udi.shkolnik@alicesolutionsgroup.com">udi.shkolnik@alicesolutionsgroup.com</a></li>
      </ul>
      <hr />
      <p>Best regards,<br/>
      AliceSolutions Group<br/>
      <a href="https://alicesolutionsgroup.com">alicesolutionsgroup.com</a></p>
    `;

    // Send report to user
    await emailService.sendEmail({
      to: email,
      subject: 'Your Security Assessment Report - AliceSolutions Group',
      html: reportHtml,
    });

    // Send notification to admin
    await emailService.sendEmail({
      to: 'udi.shkolnik@alicesolutionsgroup.com',
      subject: `ISO Studio: QuickBot Assessment Completed - ${email}`,
      html: `
        <h2>ISO Studio QuickBot Assessment</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Readiness:</strong> ${readinessLevel || 'Medium'} (${percentage || 0}%)</p>
        <p><strong>Completed at:</strong> ${new Date().toISOString()}</p>
        <hr />
        <p><strong>Potential lead from ISO Studio QuickBot!</strong></p>
        <p>Score: ${percentage || 0}% - ${readinessLevel || 'Medium'}</p>
      `,
    });

    res.json({ 
      success: true, 
      message: `Assessment report sent to ${email}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to send QuickBot report:', error);
    res.status(500).json({ error: "Failed to send assessment report" });
  }
};

