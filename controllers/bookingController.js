//-->#0.IMPORT CORE MODULE
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Stripe = require('stripe');

//-->#1.IMPORT CUSTOM MODULES
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //-->#1.Get the currently booked tour
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const tour = await Tour.findById(req.params.tourId);
  console.log(tour.price);

  //-->#2.Create checkout session
  // NOTES: https://stripe.com/docs/payments/accept-a-payment
  // NOTES: https://stripe.com/docs/api/checkout/sessions/create?lang=node

  const session = await stripe.checkout.sessions.create({
    //->Information about the session
    payment_method_types: ['card'],
    success_url: `${process.env.SERVER_URL}/`,
    cancel_url: `${process.env.SERVER_URL}/tour/${tour.slug}`,
    // success_url: `${req.protocol}://${req.get('host')}/`,
    // cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    // success_url: `${process.env.SERVER_URL}/success.html`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    //->Information about the items in the cart
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, //amounts in cents to be charged
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      }, //individual line item per new API
    ], //accomodates multiple line items each defined in its own {} curly braces
    mode: 'payment',
  });

  //-->#3.Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});
