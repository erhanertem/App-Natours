//-->IMPORT 3RD PARTY MODULES FOR OPERATIONS
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' }); //FIRST CONFIGURE THE ENVIRONMENT
const Tour = require('../../models/tourModel');

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
); // we have to convert the JSON file content to javascipt object to call in our JS code.

//--->IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
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
  process.exit();
};

console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
