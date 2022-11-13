const AppError = require('../utils/appError');

const handleCastErrorDB = error => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDublicateFieldsDB = error => {
  const message = `Duplicate field value: '${error.keyValue.name}'. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = error => {
  const errList = Object.values(error.errors).map(el => el.message);
  const message = `Invalid input data. ${errList.join('; ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please login again!', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //->Operational, trusted error: send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      operational: err.isOperational,
    });

    //->Programming or other unknown errors details shouldn't be leaked to the client
  } else {
    //1.Log the err to the console
    console.log('ERROR 💥', err);
    //2.Send a generic message
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
    //->HANDLE BAD GET TOUR NAME ERR
    //1. 127.0.0.1:3000/api/v1/tours/wwww creates an invalid id GET req which causes internal mongoose error which we need to respond in production

    let error = Object.create(err); // let error = { ...err };

    if (err.name === 'CastError') error = handleCastErrorDB(err); //this will create a custom appErr - err.name CastError caused by mongoose
    //->HANDLE UNIQUE FIELD POST INPUT ERR
    //127.0.0.1:3000/api/v1/tours with already allocated unique value via POST method
    if (err.code === 11000) error = handleDublicateFieldsDB(err); //this will create a custom appErr - err.code 11000 caused by MongoDB
    //->HANDLE IRRELEVANT FIELD/VALIDATOR VIOLATOR PATCH INPUT ERR
    //127.0.0.1:3000/api/v1/tours/63692be1ddf2bad76f5b8398
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err); //this will create a custom appErr - err.name ValidationError caused by mongoose
    if (err.name === 'JsonWebTokenError') error = handleJWTError(err); // err if no token available
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(err); //err if token is not valid anymore

    sendErrorProd(error, res); //send custom err in production
  }
};
