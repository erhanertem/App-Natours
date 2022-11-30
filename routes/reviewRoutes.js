//-->#0.IMPORT CORE MODULE
const express = require('express');

//-->#1.IMPORT CUSTOM MODULES
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//-->#2.CREATE CHILD ROUTER
const router = express.Router({ mergeParams: true }); //we would need mergeParams as router.use('/:tourId/reviews', reviewRouter); @tourRoutes.js calls this module for routing and this module has no access to tourId.. So basically, :tourId is merged into this module...

//POST /tours/129299334/reviews // router.use('/:tourId/reviews', reviewRouter); @tourRoutes.js
//POST /reviews // Mounted app.use('/api/v1/reviews', reviewRouter); @app.js
//GET  /tours/129299334/reviews
//IMPORTANT! Due to mergeParams all redirected to route below...

//-->#3.DEFINE ROUTES
//IMPORTANT! PROTECT ALL ROUTES AFTER THIS MIDDLEWARE
router.use(authController.protect);

//--->USER ONLY ROUTES
router.route('/').get(reviewController.getAllReviews).post(
  // authController.protect,
  authController.restrictTo('user'),
  reviewController.setTourUserIds,
  reviewController.createReview
);

//--->MIX AUTHORIZATION ROUTES
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

//-->#4.EXPORT MODULE
module.exports = router;
