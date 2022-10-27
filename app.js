//NOTE: ITS A GOOD PRACTICE TO ISOLATE CODES. HERE LAYS EVERYTHING RELATED TO EXPRESS

//-->IMPORT CORE MODULES
const express = require('express');
const morgan = require('morgan');

//-->IMPORT CUSTOM MODULES
const tourRouter = require('./routes/tourRoutes'); //for require, ${__dirname} is not necessary
const userRouter = require('./routes/userRoutes');

//-->START EXPRESS.JS
const app = express(); //Call express function to use its functions

//-->#1.MIDDLEWARES
//IF PROCESS.ENV SHOWS DEVELOPMENET FOR NODE_ENV THEN ONLY USE MORGAN.
//NOTE: HOW DO WE HAVE ACCESS TO PROCESS.ENV IF ITS CALLED IN SERVER.JS. SERVER STARTS AND CALLS THE APP. PROCESS.ENV IS EALRLIER DEFINED ONCE BY THE DOTENV SO ITS AVAILABLE FOR EVERY FILE AFTER
if (process.env.NODE_ENV === 'developement') {
  app.use(morgan('dev')); //GLOBAL MIDDLEWARE - We used morgan with dev option - Console.log reporter @ node REPL
}
app.use(express.json()); //GLOBAL MIDDLEWARE - USEFULL FOR POST REQ JSON HANDLING.
// app.use(express.static(`${__dirname}/public`)); //SERVING HTML CSS ETC STATIC FILES
app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//-->#2.ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//-->#3.LINK EXPRESS TO SERVER AS CUSTOM MODULE
module.exports = app;
