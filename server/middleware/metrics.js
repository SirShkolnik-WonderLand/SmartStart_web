module.exports = function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1e6;
    const path = req.path;
    const method = req.method;
    const status = res.statusCode;
    console.log(`[METRIC] ${method} ${path} ${status} ${ms.toFixed(1)}ms`);
  });
  next();
};
