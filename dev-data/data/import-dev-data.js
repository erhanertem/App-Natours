//-->IMPORT CORE MODULES FOR OPERATIONS
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
//-->IMPORT 3RD PARTY MODULES FOR OPERATIONS
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' }); //FIRST CONFIGURE THE ENVIRONMENT

//--->ESTABLISH MONGODB ATLAS HOSTED CONNECTION
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(() => {
  console.log('DB connection success');
});

//--->READ JSON FILE AND PARSE TO JS OBJECT
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
); // we have to convert the JSON file content to javascipt object (array) to call in our JS code.

//--->IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours); //mongoose model.create() method
    console.log('Data succesfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//--->DELETE ALL EXISTING DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit(); //node.js process method that terminate the process synchronously
};

console.log(process.argv); //argv is a node.js process property that returns an array of node processes...3rd argument would be our option passed on the process

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
