//NOTE: ITS A GOOD PRACTICE TO ISOLATE CODES. HERE LAYS EVERYTHING RELATED TO EXPRESS

//-->IMPORT CORE MODULES
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

//-->IMPORT CUSTOM MODULES
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController'); //global error handler
const tourRouter = require('./routes/tourRoutes'); //for require, ${__dirname} is not necessary
const userRouter = require('./routes/userRoutes');

//-->START EXPRESS.JS
const app = express(); //Call express function to use its functions

//-->#1.GLOBAL MIDDLEWARES

//->SET SECURITY HTTP HEADERS MIDDLEWARE
app.use(helmet()); //GOT TO BE THE FIRST GLOBAL MIDDLEWARE TO EXECUTE FOR SECURITY

//->DEVELOPMENT LOGGING MIDDLEWARE
// console.log(process.env.NODE_ENV);
//IF PROCESS.ENV SHOWS DEVELOPMENET FOR NODE_ENV THEN ONLY USE MORGAN.
//NOTE: HOW DO WE HAVE ACCESS TO PROCESS.ENV IF ITS CALLED IN SERVER.JS. SERVER STARTS AND CALLS THE APP. PROCESS.ENV IS EALRLIER DEFINED ONCE BY THE DOTENV SO ITS AVAILABLE FOR EVERY FILE AFTER
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //GLOBAL MIDDLEWARE - We used morgan with dev option - Console.log reporter @ node REPL
}

//->LIMIT REQUESTS FROM SAME API
//IMPORTANT REQUEST LIMITER MIDDLEWARE TO COPE WITH D-O-S AND BRUTEFORCE ATTACKS
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, //60mins
  max: 100, // Limit 100 requests per 60mins
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter); //WE APPLY THIS MIDDLEWARE WHICH EFFECTS ALL ROUTES STARTING WITH /API...

//->BODY PARSER, READING DATA FROM BODY INTO REQ.BODY
app.use(express.json({ limit: '10kb' })); //GLOBAL MIDDLEWARE - USEFULL FOR POST REQ JSON HANDLING. Anything larger than 10kb is not be accepted.

//->DATA SANITIZATION AGAINST NOSQL QUERY INJECTIONS
app.use(mongoSanitize());

//->DATA SANITIZATION AGAINST XSS
app.use(xss());

//->SERVING STATIC FILES
app.use(express.static(`${__dirname}/public`));

//->TEST MIDDLEWARE
app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

//->TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(x); //Create an unexceptional error for testing
  // console.log(req.headers); //WEB HTTP API
  next();
});

//-->#2.ROUTES
app.use('/api/v1/tours', tourRouter); //watch for this route
app.use('/api/v1/users', userRouter); //watch for this route

//If all above routes not matched then apply to rest of the HTTP routes with this callback function....
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`); //We create a new error object with custom message
  // err.status = 'fail'; //We define status for centrilized handling
  // err.statusCode = 404; //We define statuscode for centrilized handling
  // next(err); //anything passed inside next() is assumed err always...

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); //anything passed inside next() is assumed err always...
});

//-->#3.CENTRILIZED Typical error handling express middleware
app.use(errorController); //run global error handler

//-->#4.LINK EXPRESS TO SERVER AS CUSTOM MODULE
module.exports = app;
