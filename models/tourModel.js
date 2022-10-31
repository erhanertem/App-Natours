//-->IMPORT 3RD PARTY MODULE
const mongoose = require('mongoose');

//->CREATE A BASIC MONGOOSE SCHEMA
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour mush have a difficulty'],
  },
  ratingAverage: { type: Number, default: 4.5 },
  ratingQunatity: { type: Number, default: 0 },
  price: { type: Number, required: [true, 'A tour must have a price'] },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String], //images shall include an array of strings, not a single string
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date], //in order to have different start dates for the same tour
});
//->CREATE A MODEL OUT OF THE CREATED SCHEMA
const Tour = mongoose.model('Tour', tourSchema); //Create a collection in the database to upload data per the schema

module.exports = Tour; //Since we want to export only Tour, we use default module.exports for exporting
