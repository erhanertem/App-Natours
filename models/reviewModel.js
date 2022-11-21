//-->IMPORT CORE MODULES
const mongoose = require('mongoose');

//->CREATE A BASIC MONGOOSE SCHEMA
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'An empty review is not valid'],
      trim: true,
      maxlength: [500, 'A review must have less or equal to 500 characters'],
      minlength: [10, 'A review must have more or equal to 10 characters'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    //PARENT REFERENCING FIELD TO TOUR
    tour: {
      type: mongoose.ObjectId,
      ref: 'Tour', //inline referencing
      required: [true, 'Review must belong to a tour'],
    },
    //PARENT REFERENCING FIELD TO USER
    reviewer: {
      type: mongoose.ObjectId,
      ref: 'User', //inline referencing
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true }, //allows virtuals to be visible to JSON convert
    toObject: { virtuals: true }, //allows virtuals to be visible to console.log
  }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
