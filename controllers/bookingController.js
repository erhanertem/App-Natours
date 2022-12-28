//-->#0.IMPORT CORE MODULE
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const Stripe = require('stripe');
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

//-->#1.IMPORT CUSTOM MODULES
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
// const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //-->#1.Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId); //@bookingRoutes.js router route!
  // console.log(tour.price);

  //-->#2.Create checkout session
  // NOTES: https://stripe.com/docs/payments/accept-a-payment
  // NOTES: https://stripe.com/docs/testing?testing-method=card-numbers
  // NOTES: https://stripe.com/docs/checkout/quickstart
  // NOTES: https://stripe.com/docs/api/checkout/sessions/create?lang=node

  const session = await stripe.checkout.sessions.create({
    //->Information about the items in the cart
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100, //amounts in cents to be charged
        },
        quantity: 1,
      }, //individual line item per new API
    ], //accomodates multiple line items each defined in its own {} curly braces
    //->Information about the session
    // payment_method_types: ['card'],
    // expand: ['line_items'],
    mode: 'payment', //Checkout has three modes: payment, subscription, or setup. Use payment mode for one-time purchases. Learn more about subscription and setup modes in the docs.
    // success_url: `${process.env.SERVER_URL}/success.html`,
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`, //Temporary url assigment
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
  });
  //-->#3.Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //This is only temporary unsecure solution....
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) {
    return next();
  } //  if booking not checked out, authController.isLoggedIn, ->  viewsController.getOverview;
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getAllBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
