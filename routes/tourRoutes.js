//-->#0.IMPORT CORE MODULE
const express = require('express');

//-->#1.IMPORT CUSTOM MODULES
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

//-->#2.CREATE CHILD ROUTER
const router = express.Router();

// //-->#3.CUSTOM GLOBAL CHECK MIDDLEWARE
// router.param('id', tourController.checkID); //NOTE: SINCE THIS EXPRESS ROUTER METHOD(KINDA MIDDLEWARE) IS MADE AVAILABLE LOCALLY, IT CAN'T BE ASSESSED BY USERS....IT SIMPLY ACTS AS A LOCAL SUB APP. CHECKS AUTOMATICALLY 'ID' PARAMETER @ .route('/:id') INPUT WHETHER ITS VALID OR NOT..

//NESTED ROUTES
//POST  /tour/234fad4/reviews
//GET  /tour/234fad4/reviews
//GET  /tour/234fad4/reviews/04848784
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

router.use('/:tourId/reviews', reviewRouter); //Router mounting - Whenever a route is used initiate reviewRouter middleware. By doing so instead of solving a review related issue in a tour route, we pass onto the most relevant place where it needs to get handled.

//-->#3.DEFINE ROUTES
router
  .route('/')
  .get(authController.protect, tourController.getAllTours) //first we require the user to login via autController.protect middleware then we abuse getAllTours handler middleware
  .post(tourController.createTour); //Middleware chaining - First precheck inputs and later crete tour

router
  .route('/top-5-cheap') //Route aliasing --> Responding to 127.0.0.1:3000/api/v1/tours/top-5-cheap route request from postman
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect, //check for correct token with matching user and password, clear out security
    authController.restrictTo('admin', 'lead-guide'), //restrict the deletion of tour to admin or lead-guide middleware call
    tourController.deleteTour
  );

//-->#4.EXPORT MODULE
module.exports = router;
