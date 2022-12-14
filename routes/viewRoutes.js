//-->#0.IMPORT CORE MODULE
const express = require('express');

//-->#1.IMPORT CUSTOM MODULE
const viewsController = require('../controllers/viewController');
const authController = require('../controllers/authController');
// const bookingController = require('../controllers/bookingController');

//-->#2.CREATE CHILD ROUTER
const router = express.Router();

//-->#3.DEFINE ROUTES
// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker',
//     user: 'Jonas',
//   });
// }); //Let express define (router.get()) route for '/' from which in the event of a successful response, pug will render(router.render()) file called "base" inside the specified views folder.
// IMPORTANT! router.get() vs router.use() - since all routes start with / using router.use() would ovcerride the consequent routes. For that we use router.get() to only allow for / route and not the ones starting with /.

// router.use(authController.isLoggedIn); //Below this line all routes uses this middleware for protected views

router.use(viewsController.alerts); //It runs on each and every route definede below and if it finds a data-alert assigned alert then its triggered

router.get(
  '/', //this is the route that will be hit when a successfull checkout occurs...
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
// router.get('/tour/:slug', authController.protect, viewsController.getTour); //Testing axios>cookie-parser>protected-route-entry scenario
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get(
  '/my-tours',
  // bookingController.createBookingCheckout,
  authController.protect,
  viewsController.getMyTours
);

// //- #1. Traditional HTML5 only POST version
// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewsController.updateUserData
// );

//-->#4.EXPORT MODULE
module.exports = router;
