const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId }; //APPLIES FILTER IF REVIEWROUTER CATCHES ANY MERGED PARAMS FROM TOURROUTER - GET ALLREVIEWS FOR A TOUR ROUTE

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  //Allow Nested Routes - User can manually specify
  if (!req.body.tour) req.body.tour = req.params.tourId;
  req.body.user = req.user._id; //retrieved from authController.protect

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
