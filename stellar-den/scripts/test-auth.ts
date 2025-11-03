#!/usr/bin/env tsx
import { initializeTOTP, verifyTOTP, getUser, findUserByEmail } from "../server/services/authService.js";

const email = process.argv[2] || "test@example.com";

console.log("🧪 Testing Authentication System\n");
console.log("=" .repeat(60));

// Test 1: Check if user exists
console.log("\n1️⃣ Checking if user exists...");
const existingUser = findUserByEmail(email);
if (existingUser) {
  console.log(`✅ User found: ${existingUser.email}`);
  console.log(`   ID: ${existingUser.id}`);
  console.log(`   Has secret: ${!!existingUser.secret}`);
  console.log(`   Secret backed up: ${existingUser.secretBackedUp}`);
  
  if (existingUser.secret) {
    console.log(`\n2️⃣ Testing code verification...`);
    console.log(`   Secret: ${existingUser.secret.substring(0, 10)}...`);
    console.log(`   ⚠️  Enter a code from your authenticator app to test`);
    console.log(`   Example: node scripts/test-auth.ts ${email} 123456`);
    
    const testCode = process.argv[3];
    if (testCode) {
      const verified = verifyTOTP(existingUser.id, testCode);
      console.log(`   Verification result: ${verified ? "✅ SUCCESS" : "❌ FAILED"}`);
    }
  } else {
    console.log(`\n❌ User has no secret! Need to re-initialize.`);
  }
} else {
  console.log(`\n❌ User not found: ${email}`);
  console.log(`\n💡 To create a user, use the web interface at /iso-studio`);
}

console.log("\n" + "=" .repeat(60));

