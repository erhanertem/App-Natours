const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  //Operational, trusted error: send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    //Programming or other unknown errors details shouldn't be leaked to the client
  } else {
    //Log the err to the console
    console.log('ERROR 💥', err);
    //Send a generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //Defines the error code. Default 500 means internal server err
  err.status = err.status || 'error'; //Defines the error message. Default is set to 'error' string

  //NOTE: WE WOULD LIKE TO SEND AS MINIMAL ERRORS AS POSSIBLE TO THE CLIENT IN PRODUCTION MODE AND SEND AS MUCH ERRORS AS WE CAN IN DEVELOPMENT PHASE SO WE NEED TO ESTABLISH CONDITIONS FOR BOTH PROCESS ENVIROMENTS
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  }
};
