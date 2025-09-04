const bcrypt = require('bcryptjs');

async function testPasswordValidation() {
    try {
        console.log('🔍 TESTING PASSWORD VALIDATION');
        console.log('===============================');

        const testPassword = 'AdminPass123!';
        const hashedPassword = '$2a$12$LLv...'; // This is what we saw in the database

        console.log(`Test password: ${testPassword}`);
        console.log(`Hashed password: ${hashedPassword}`);

        // Test password validation rules
        console.log('\n1. Testing password strength validation:');
        console.log(`Length >= 8: ${testPassword.length >= 8 ? '✅' : '❌'} (${testPassword.length})`);
        console.log(`Has uppercase: ${/(?=.*[A-Z])/.test(testPassword) ? '✅' : '❌'}`);
        console.log(`Has lowercase: ${/(?=.*[a-z])/.test(testPassword) ? '✅' : '❌'}`);
        console.log(`Has number: ${/(?=.*\d)/.test(testPassword) ? '✅' : '❌'}`);
        console.log(`Full regex test: ${/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(testPassword) ? '✅' : '❌'}`);

        // Test with a working user's password
        console.log('\n2. Testing with working user password:');
        const workingPassword = 'TestPass123!';
        console.log(`Working password: ${workingPassword}`);
        console.log(`Length >= 8: ${workingPassword.length >= 8 ? '✅' : '❌'} (${workingPassword.length})`);
        console.log(`Has uppercase: ${/(?=.*[A-Z])/.test(workingPassword) ? '✅' : '❌'}`);
        console.log(`Has lowercase: ${/(?=.*[a-z])/.test(workingPassword) ? '✅' : '❌'}`);
        console.log(`Has number: ${/(?=.*\d)/.test(workingPassword) ? '✅' : '❌'}`);
        console.log(`Full regex test: ${/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(workingPassword) ? '✅' : '❌'}`);

    } catch (error) {
        console.error('❌ Error testing password validation:', error);
    }
}

testPasswordValidation();