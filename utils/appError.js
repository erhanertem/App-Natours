class AppError extends Error {
  // class AppError {
  constructor(message, statusCode) {
    super(message);
    // this.message = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor); //creates a node.js stack property on the err object
  }
}

module.exports = AppError;
