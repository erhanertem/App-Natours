//-->IMPORT CORE MODULES
const mongoose = require('mongoose');

//-->#1.IMPORT CUSTOM MODULES
const Tour = require('./tourModel'); //Mongoose tour model needs to be imported here to persist the Review static method output to TourModel.

//->CREATE A BASIC MONGOOSE SCHEMA
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'An empty review is not valid'],
      // trim: true,
      // maxlength: [500, 'A review must have less or equal to 500 characters'],
      // minlength: [10, 'A review must have more or equal to 10 characters'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    //PARENT REFERENCING FIELD TO TOUR
    tour: {
      type: mongoose.ObjectId, // same as type: mongoose.Schema.ObjectId,
      ref: 'Tour', //inline referencing
      required: [true, 'Review must belong to a tour'],
    },
    //PARENT REFERENCING FIELD TO USER
    user: {
      type: mongoose.ObjectId, // same as type: mongoose.Schema.ObjectId,
      ref: 'User', //inline referencing
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true }, //allows virtuals to be visible to JSON convert
    toObject: { virtuals: true }, //allows virtuals to be visible to console.log
  }
);

//-->MONGOOSE PREFIND QUERRY MIDDLEWARE/HOOK for populating parent references in the Review schema in order to make it available for getAllreviews middleware
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

////////////////////////////////////////////////
//WE CREATE THE STATIC METHOD AND CALL IT LATER
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    //this points to current Model due to statics method...
    {
      $match: { tour: { $eq: tourId } },
    }, //select the tour we want to update
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      }, //group by tourid, ...
    },
  ]);
  // console.log(stats);

  //->IF THERE ARE REVIEWS ASSIGN QUANTITY AND AVG RATINGS
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    }); //we await the promise from mongoose
  }
  //->IF THERE ARE NO REVIEWS LEFT AFTER DELETE ASSIGN THE DEFAULTS
  else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
//->COVERS ONLY ACTIONS OF SAVING A REVIEW
reviewSchema.post('save', doc => {
  //IT MAKERS TO USE POST AND SAVE AS CALCAVERAGERATINGS FUNCTION IS APPLIED RIGHT AFTER THE DOCUMENT IS SAVED
  // reviewSchema.post('save', function () {
  //this points to current review
  // Review.calcAverageRatings(this.tourId); //VERY IMPORTANT! Problem with this is mongoose model is not created yet. If we locate this snippet after Review is modelled then it wouldnt be included in the schema. Therefore, ( https://stackoverflow.com/questions/29664499/mongoose-static-methods-vs-instance-methods ), we refer to Model via this.constructor which exists in instance documents as well.
  // console.log('🎈', this.constructor, this.tour, '🎈');
  // this.constructor.calcAverageRatings(this.tour);
  doc.constructor.calcAverageRatings(doc.tour);
});
//->COVERS ACTIONS OF UPDATING OR DELETING A REVIEW - FINDONEANDUPDATE/FINDBYIDANDUPDATE OR FINDONEONEANDDELETE/FINDBYIDANDDELETE....
reviewSchema.post(/^findOneAnd/, doc => {
  //IT MAKERS TO USE POST AND SAVE AS CALCAVERAGERATINGS FUNCTION IS APPLIED RIGHT AFTER THE DOCUMENT IS DELETED OR UPDATED
  doc.constructor.calcAverageRatings(doc.tour);
});

//VERY IMPORTANT! If there are two post-save hooks and one needs to initiate one after another, then we use async/await callback function or (doc,next) as inputs to make them async operations.Here, we do not have two similar post-save hooks and no logic order is essential so async holds no gorund here!
////////////////////////////////////////////////////

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
