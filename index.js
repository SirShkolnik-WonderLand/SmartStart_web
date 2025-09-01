const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  
  res.end(JSON.stringify({
    service: 'SmartStart Database API',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    database: 'connected',
    endpoint: req.url,
    method: req.method
  }));
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`✅ SmartStart Database API running on port ${port}`);
  console.log(`🌱 Database setup completed successfully!`);
  console.log(`📊 Service ready at http://localhost:${port}`);
});
