module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //Defines the error code. Default 500 means internal server err
  err.status = err.status || 'error'; //Defines the error message. Default is set to 'error' string
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
