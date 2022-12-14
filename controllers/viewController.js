const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  //Step#1 Get tour data from collection
  const tours = await Tour.find(); //find all of the tours
  //Step#2 Build template
  //Step#3 Render that template using tour data from Step#1
  res.status(200).render('overview', {
    title: 'All tours',
    tours, // sames as tours: tours, for ES6
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //Step#1 Get the data for the requested tour including reviews and guides
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  //NOTE: if we do not check this status, error block would be leaked to client side.with improper message ...
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  //Step#2 Build template
  //Step#3 Render template using the data from Step#1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`, //browser tab title
    tour, // same as tour: tour, for ES6
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'Log into your account' });
};
