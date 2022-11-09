class AppError extends Error {
  // class AppError {
  constructor(message, statusCode) {
    super(message);
    // this.message = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //IMPORTANT: we mark all the errors we created ourselves as operational errors. These are the messages that should only be sent to the client.

    Error.captureStackTrace(this, this.constructor); //creates a node.js stack property on the err object
  }
}

module.exports = AppError;
