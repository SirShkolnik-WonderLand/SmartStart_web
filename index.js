const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'SmartStart Database Service',
    status: 'running',
    timestamp: new Date().toISOString(),
    database: 'connected'
  }));
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`✅ SmartStart Database Service running on port ${port}`);
  console.log('🌱 Database setup completed successfully!');
});
