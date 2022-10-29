//NOTE: ITS A GOOD PRACTICE TO ISOLATE CODES. HERE LAYS EVERYTHING RELATED TO SERVER
//-->IMPORT 3RD PARTY MODULE
const mongoose = require('mongoose');

const dotenv = require('dotenv'); //FIRST CONFIGURE THE ENVIRONMENT

//-->IMPORT EXPRESS APP MODULE
const app = require('./app'); //LATER RUN THE APP SO THAT WE MAKE PROCESS VARIABLE AVAILABE TO APP

dotenv.config({ path: './config.env' }); //dotenv module acquires env data from the config.env file and assings them to process.env
// console.log(app.get('env')); //Shows current enviroment we are in.
// console.log(process.env); //Node enviroment...

//--->MONGODB ATLAS HOSTED CONNECTION
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(connection => {
  // console.log(connection.connections);
  console.log('DB connection success');
}); //mongoose connect returns a promise and we then handle with then to log the promise.
// //--->MONGODB LOCAL HOSTED CONNECTION
// mongoose.connect(process.env.DATABASE_LOCAL).then(() => {
//   console.log('DB connection success');
// }); //mongoose connect returns a promise and we then handle with then to log the promise.

//->CREATE A BASIC MONGOOSE SCHEMA
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: { type: Number, default: 4.5 },
  price: { type: Number, required: [true, 'A tour must have a price'] },
});
//->CREATE A MODEL OUT OF THE CREATED SCHEMA
const Tour = mongoose.model('Tour', tourSchema); //Create a collection in the database to upload data per the schema

const testTour = new Tour({
  name: 'The Forest Hiker',
  rating: 4.7,
  price: 497,
}); //testtour is an instance of tour model
testTour
  .save()
  .then(doc => {
    console.log(doc);
  })
  .catch(err => {
    console.log('ERROR 🎃', err);
  }); //mongoose save method returns a promise which requires catching err as well.

//-->START SERVER
const port = process.env.PORT || 8000; //Declare port first from process.env.PORT cfg or as a fallback manually set to 3000
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
