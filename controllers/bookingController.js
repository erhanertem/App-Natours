//-->#0.IMPORT CORE MODULE
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const Stripe = require('stripe');
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

//-->#1.IMPORT CUSTOM MODULES
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
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
    //->Information about the session
    payment_method_types: ['card'],
    // expand: ['line_items'],
    mode: 'payment', //Checkout has three modes: payment, subscription, or setup. Use payment mode for one-time purchases. Learn more about subscription and setup modes in the docs.
    // success_url: `${process.env.SERVER_URL}/success.html`,
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`, //Temporary url assignment
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    //->Information about the items in the cart
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, //amounts in cents to be charged
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ],
          },
        },
      }, //individual line item per new API
    ], //accomodates multiple line items each defined in its own {} curly braces
  });
  //-->#3.Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   //This is only temporary unsecure solution....
//   const { tour, user, price } = req.query;

//   if (!tour && !user && !price) {
//     return next();
//   } //  if booking not checked out, authController.isLoggedIn, ->  viewsController.getOverview;
//   await Booking.create({ tour, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async eventData => {
  const tour = eventData.client_reference_id; //defined the tour from the stripe event data object
  const price = eventData.amount_total; //defined the price from the stripe event data object
  const user = await User.findOne({ email: eventData.customer_email }); //defined the user from the stripe event data object
  await console.log(user, user.id, user._id);
  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    ); //this req.body is available in raw data stream format
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  //Handle the event
  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  // Return a 200 response to acknowledge receipt of the event to Stripe
  res.status(200).json({ received: true });

  next();
}; //this function needs the req.body in raw format so we position webhook @ app.js before the body parser which jsonifies the re.body

exports.createBooking = factory.createOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
