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
    user: {
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

//-->MONGOOSE PREFIND QUERRY MIDDLEWARE/HOOK for populating parent references in the Review schema in order to make it available for getAllreviews middleware
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

//WE CREATE THE STATIC METHOD AND CALL IT LATER
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    //this points to current Model due to statics method...
    {
      $match: { tour: tourId },
    }, //select the tour we want to update
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      }, //group by tourid, ...
    },
  ]);
  console.log(stats);
};
reviewSchema.post('save', function () {
  //this points to current review
  // Review.calcAverageRatings(this.tourId); //VERY IMPORTANT! Problem with this is mongoose model is not created yet. If we locate this after Review is modelled then it wouldnt be included in the schema. Therefore, ( https://stackoverflow.com/questions/29664499/mongoose-static-methods-vs-instance-methods ), we refer to Model via this.constructor which exists in instance documents as well.
  // console.log('🎈', this.constructor, this, '🎈');
  //this.constructor = Review
  this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
