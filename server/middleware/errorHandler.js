'use strict';

/**
 * Centralised error handling middleware.
 * Catches any unhandled errors and returns a consistent JSON shape.
 */

/**
 * 404 handler — mount before the global error handler.
 */
function notFound(req, res) {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
}

/**
 * Global error handler — must have 4 parameters for Express to recognise it.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';

  // Known API-key errors
  if (err.message?.includes('GROQ_API_KEY')) {
    return res.status(503).json({
      success: false,
      error:   'AI service unavailable — GROQ_API_KEY not configured',
    });
  }

  // Multer file errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: 'File too large (max 10 MB)' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, error: 'Unexpected file field' });
  }

  const status  = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Internal server error';

  res.status(status).json({
    success: false,
    error:   message,
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
