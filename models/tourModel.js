//-->IMPORT 3RD PARTY MODULE
const mongoose = require('mongoose');

//->CREATE A BASIC MONGOOSE SCHEMA
const tourSchema = new mongoose.Schema(
  {
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
      select: false, // field limiting by default (permenantly hides from the output...so the client.can not see it.)
    },
    startDates: [Date], //in order to have different start dates for the same tour
  }, //SCHEMA DEFINITIONS

  {
    toJSON: { virtuals: true }, //allows virtuals to be visible to JSON convert
    toObject: { virtuals: true }, //allows virtuals to be visible to console.log
  } //SCHEMA OPTIONS -> //IMPORTANT By default, Mongoose does not include virtuals when you convert a document to JSON. Here it has to be specified by options object whether to disclose them in JSON response or console.log...
);

// IMPORTANT VIRTUAL PROPERTIES ARE NOT SAVED TO DATABASE TO SAVE SPACE....
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //we got to use a regular function declaration as we would need this keyword to point to tourSchema upon which we called Schema.prototype.virtual() method to declare a temporary field on the mongoose schema object.
}); //In queries the virtuals could not be used...as they re not part of the real database....They are runtime data...

//->CREATE A MODEL OUT OF THE CREATED SCHEMA
const Tour = mongoose.model('Tour', tourSchema); //Create a collection in the database to upload data per the schema

module.exports = Tour; //Since we want to export only Tour, we use default module.exports for exporting
