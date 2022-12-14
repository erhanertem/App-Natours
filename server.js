//NOTE: ITS A GOOD PRACTICE TO ISOLATE CODES. HERE LAYS EVERYTHING RELATED TO SERVER
//-->IMPORT 3RD PARTY MODULE
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const dotenv = require('dotenv'); //FIRST CONFIGURE THE ENVIRONMENT

dotenv.config({ path: './config.env' }); //dotenv module acquires env data from the config.env file and assings them to process.env
// console.log(app.get('env')); //Shows current enviroment we are in.
// console.log(process.env); //Node enviroment...

//--> GLOBAL NODE.JS EVENT LISTENER FOR UNHANDLED EXCEPTIONS ERR
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name);
  process.exit(1);
}); //HANDLING HERE BEFORE ALL HELPS TO CATCH A MAJORITY OF UNHANDLED EXCEPTIONS

//-->IMPORT EXPRESS APP MODULE
const app = require('./app'); //LATER RUN THE APP SO THAT WE MAKE PROCESS VARIABLE AVAILABE TO APP

//--->MONGODB ATLAS HOSTED CONNECTION
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(() => {
  // mongoose.connect(DB).then(connection => {
  // console.log(connection.connections);
  console.log('DB connection success');
}); //mongoose connect returns a promise and we then handle with then to log the promise.
// .catch(err => console.log('ERROR')); //Unhandled rejection err handling
// //--->MONGODB LOCAL HOSTED CONNECTION
// mongoose.connect(process.env.DATABASE_LOCAL).then(() => {
//   console.log('DB connection success');
// }); //mongoose connect returns a promise and we then handle with then to log the promise.

//-->START SERVER
const port = process.env.PORT || 3000; //Declare port first from process.env.PORT cfg or as a fallback manually set to 3000
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//--> GLOBAL NODE.JS EVENT LISTENER FOR UNHANDLED REJECTION ERR
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  }); //gracefully closes the server
  // process.exit(1); //abruptly ends all operations..not preferable..
});

// console.log(x); //An example of an unhandled exception..Logging something that does not exist!
