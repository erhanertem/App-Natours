const Tour = require('../models/tourModel');
const Bookings = require('../models/bookingModel');
// const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');

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

exports.getAccount = (req, res) => {
  res.status(200).render('account', { title: 'Your account' });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  //#1.Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  //#2.Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour); //map() creates a new array of tour IDs
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  //#3.Send response
  res.status(200).render('overview', { title: 'My Tours', tours });
});

// //- #1. Traditional HTML5 only POST version
// exports.updateUserData = catchAsync(async (req, res, next) => {
//   // console.log('UPDATING', req.body);
//   //#1.Update the user data
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true, //if true, return the modified document rather than the original
//       runValidators: true, // if true, runs update validators on this command. Update validators validate the update operation against the model's schema
//     } //mongoose options
//   );
//   //#2.Render the view
//   res
//     .status(200)
//     .render('account', { title: 'Your account', user: updatedUser });
// });
