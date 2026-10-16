/**
 * Global Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  console.error('[Error]', err.stack || err.message || err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const isHtmlRoute = req.path.startsWith('/dev') || req.path.includes('/player/proxy');

  // If request accepts HTML and is a dev page or player proxy embed
  if (req.accepts('html') && isHtmlRoute) {
    return res.status(status).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Error - Anime Stream Hindi</title></head>
        <body style="background:#0a0a0d;color:#f3f4f6;font-family:sans-serif;padding:30px;line-height:1.6;">
          <h2 style="color:#ef4444;">Server Error (${status})</h2>
          <p>${message}</p>
          <pre style="background:#16161d;padding:15px;border-radius:8px;overflow:auto;">${err.stack || ''}</pre>
        </body>
      </html>
    `);
  }

  res.status(status).json({
    success: false,
    error: message,
    statusCode: status,
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
