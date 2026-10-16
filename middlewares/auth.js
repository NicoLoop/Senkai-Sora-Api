const config = require('../config');

/**
 * API Key Authentication Middleware
 */
function apiKeyAuth(options = { required: true }) {
  return (req, res, next) => {
    const configuredApiKey = config.apiKey;

    if (!configuredApiKey) {
      return next();
    }

    const authHeader = req.headers['authorization'];
    const bearerKey = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7).trim() 
      : null;

    const providedKey = 
      req.headers['x-api-key'] || 
      bearerKey || 
      req.query.api_key || 
      req.query.apiKey;

    if (!providedKey) {
      if (!options.required) return next();
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Missing API key. Provide via x-api-key header or ?api_key= parameter.'
      });
    }

    if (providedKey !== configuredApiKey) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Invalid API key provided.'
      });
    }

    req.authenticated = true;
    next();
  };
}

module.exports = {
  apiKeyAuth
};
