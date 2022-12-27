//-->#0.IMPORT CORE MODULE
const express = require('express');

//-->#1.IMPORT CUSTOM MODULES
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

//-->#2.CREATE CHILD ROUTER
const router = express.Router();

//-->#3.DEFINE ROUTES
// #1.way
// router
//   .route('/checkout-session/:tourId')
//   .get(authController.protect, bookingController.getCheckoutSession);
// #2.way
router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

//-->#4.EXPORT MODULE
module.exports = router;
