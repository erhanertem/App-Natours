//-->IMPORT CORE MODULES
const express = require('express');
const morgan = require('morgan');

//-->IMPORT CUSTOM MODULES
const tourRouter = require('./routes/tourRoutes'); //for require, ${__dirname} is not necessary
const userRouter = require('./routes/userRoutes');

//-->START EXPRESS.JS
const app = express(); //Call express function to use its functions

//-->#1.MIDDLEWARES
app.use(morgan('dev')); //GLOBAL MIDDLEWARE - We used morgan with dev option - Console.log reporter @ node REPL
app.use(express.json()); //GLOBAL MIDDLEWARE - USEFULL FOR POST REQ JSON HANDLING.
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

//-->#3.START SERVER
const port = 3000; //Declare port
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
