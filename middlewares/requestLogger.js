function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${elapsed}ms)`);
  });
  next();
}

module.exports = requestLogger;
