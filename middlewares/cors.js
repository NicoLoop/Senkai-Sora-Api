/**
 * CORS Middleware
 * Enables cross-origin requests and handles iframe header permissions
 */
function corsMiddleware(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}

module.exports = corsMiddleware;
