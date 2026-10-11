const { errorResponse } = require('../utils/responseUtils');
const config = require('../config/env');

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, 404, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`);
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  // If headers already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(
        res,
        400,
        `Ukuran file melebihi batas maksimum yang diperbolehkan (${config.MAX_FILE_SIZE_MB}MB)`
      );
    }
    return errorResponse(res, 400, `Gagal memproses file upload: ${err.message}`);
  }

  // Handle JSON parse error in body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 400, 'Format payload JSON tidak valid');
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server';

  // Log error stack in development/test
  if (config.NODE_ENV !== 'test') {
    console.error(`[Error Handler] ${req.method} ${req.url} - ${statusCode}:`, err);
  }

  return errorResponse(
    res,
    statusCode,
    message,
    config.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

module.exports = {
  notFoundHandler,
  errorHandler
};
