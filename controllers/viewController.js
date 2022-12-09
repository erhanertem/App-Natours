const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

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
