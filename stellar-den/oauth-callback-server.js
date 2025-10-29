/**
 * Simple callback handler for Zoho OAuth
 * This will handle the callback from https://localhost/callback
 */

import express from 'express';

const app = express();
const PORT = 443; // HTTPS port

app.get('/callback', (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    console.error('OAuth Error:', error);
    res.status(400).send(`OAuth Error: ${error}`);
    return;
  }
  
  if (code) {
    console.log('✅ OAuth Code Received:', code);
    
    // Send the code to our main server
    const mainServerUrl = 'http://localhost:8080/api/zoho/auth/callback';
    
    fetch(mainServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    })
    .then(response => response.json())
    .then(data => {
      console.log('✅ Token Exchange Result:', data);
      res.send(`
        <html>
          <head><title>Zoho OAuth Success</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #4CAF50;">✅ Zoho OAuth Success!</h1>
              <p>Your Zoho integration has been successfully authorized.</p>
              <p><strong>Status:</strong> ${data.success ? 'Success' : 'Failed'}</p>
              <p><strong>Message:</strong> ${data.message || 'No message'}</p>
              <hr>
              <p>You can now test:</p>
              <ul>
                <li>📧 Email sending</li>
                <li>📅 Meeting scheduling</li>
                <li>👥 Contact form processing</li>
              </ul>
              <p><a href="http://localhost:8080" style="color: #2196F3;">← Back to Main Server</a></p>
            </div>
          </body>
        </html>
      `);
    })
    .catch(error => {
      console.error('❌ Token Exchange Failed:', error);
      res.status(500).send(`
        <html>
          <head><title>Zoho OAuth Error</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #f44336;">❌ OAuth Error</h1>
              <p>Failed to exchange OAuth code for tokens.</p>
              <p><strong>Error:</strong> ${error.message}</p>
              <p><a href="http://localhost:8080" style="color: #2196F3;">← Back to Main Server</a></p>
            </div>
          </body>
        </html>
      `);
    });
  } else {
    res.status(400).send('No authorization code received');
  }
});

// Start HTTPS server (you'll need to run with sudo for port 443)
console.log(`🔐 OAuth Callback Server starting on port ${PORT}`);
console.log(`📝 Make sure your Zoho API Console has: https://localhost/callback`);

app.listen(PORT, () => {
  console.log(`✅ OAuth Callback Server running on https://localhost:${PORT}`);
  console.log(`🔗 Ready to receive OAuth callbacks from Zoho`);
});
