#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_DIR = path.join(__dirname, "../server/data/users");

console.log("🔍 ISO Studio User Data Viewer\n");
console.log("=" .repeat(60));

if (!fs.existsSync(USERS_DIR)) {
  console.log("❌ Users directory not found:", USERS_DIR);
  process.exit(1);
}

const files = fs.readdirSync(USERS_DIR);
const userFiles = files.filter(f => f.endsWith(".json") && !f.endsWith("_data.json"));
const dataFiles = files.filter(f => f.endsWith("_data.json"));

console.log(`\n📊 Found ${userFiles.length} user(s)\n`);

if (userFiles.length === 0) {
  console.log("No users found. Users will be created when they first authenticate.\n");
  process.exit(0);
}

for (const userFile of userFiles) {
  const userId = userFile.replace(".json", "");
  const userPath = path.join(USERS_DIR, userFile);
  const dataPath = path.join(USERS_DIR, `${userId}_data.json`);
  
  try {
    const userData = JSON.parse(fs.readFileSync(userPath, "utf-8"));
    
    console.log("─".repeat(60));
    console.log(`\n👤 USER: ${userData.email}`);
    console.log(`   ID: ${userData.id}`);
    console.log(`   Created: ${new Date(userData.createdAt).toLocaleString()}`);
    console.log(`   Last Login: ${userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : "Never"}`);
    console.log(`   Secret Backed Up: ${userData.secretBackedUp ? "✅ Yes" : "❌ No"}`);
    
    // Check for assessment data
    if (fs.existsSync(dataPath)) {
      const assessmentData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
      
      if (assessmentData.data) {
        const project = assessmentData.data;
        const answers = project.answers || {};
        const answerCount = Object.keys(answers).length;
        
        console.log(`\n📝 ASSESSMENT DATA:`);
        console.log(`   Project: ${project.name || "My ISO 27001 Project"}`);
        console.log(`   Framework: ${project.frameworkId || "iso27001"}`);
        console.log(`   Controls Answered: ${answerCount}`);
        console.log(`   Last Updated: ${new Date(assessmentData.updatedAt).toLocaleString()}`);
        
        // Count by status
        const statusCounts = {
          ready: 0,
          partial: 0,
          missing: 0,
        };
        
        Object.values(answers).forEach((answer: any) => {
          if (answer.status === "ready") statusCounts.ready++;
          else if (answer.status === "partial") statusCounts.partial++;
          else statusCounts.missing++;
        });
        
        console.log(`\n   Status Breakdown:`);
        console.log(`   ✅ Ready: ${statusCounts.ready}`);
        console.log(`   ⚠️  Partial: ${statusCounts.partial}`);
        console.log(`   ❌ Missing: ${statusCounts.missing}`);
        
        // Show recent answers
        if (answerCount > 0) {
          console.log(`\n   Recent Answers (last 5):`);
          const sortedAnswers = Object.entries(answers)
            .sort(([, a]: any, [, b]: any) => 
              new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
            )
            .slice(0, 5);
          
          sortedAnswers.forEach(([controlId, answer]: [string, any]) => {
            const statusIcon = answer.status === "ready" ? "✅" : answer.status === "partial" ? "⚠️" : "❌";
            console.log(`   ${statusIcon} ${controlId}: ${answer.status} (${answer.owner || "No owner"})`);
          });
        }
      } else {
        console.log(`\n📝 No assessment data found.`);
      }
    } else {
      console.log(`\n📝 No assessment data file found.`);
    }
    
    console.log("");
  } catch (error: any) {
    console.error(`❌ Error reading user ${userFile}:`, error.message);
  }
}

console.log("=" .repeat(60));
console.log("\n✅ View complete!\n");

