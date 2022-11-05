//-->#0.IMPORT CORE MODULE
const express = require('express');

//-->#1.IMPORT CUSTOM MODULES
const tourController = require('../controllers/tourController');

//-->#2.CREATE CHILD ROUTER
const router = express.Router();

// //-->#3.CUSTOM GLOBAL CHECK MIDDLEWARE
// router.param('id', tourController.checkID); //NOTE: SINCE THIS EXPRESS ROUTER METHOD(KINDA MIDDLEWARE) IS MADE AVAILABLE LOCALLY, IT CAN'T BE ASSESSED BY USERS....IT SIMPLY ACTS AS A LOCAL SUB APP. CHECKS AUTOMATICALLY 'ID' PARAMETER @ .route('/:id') INPUT WHETHER ITS VALID OR NOT..

//-->#3.DEFINE ROUTES
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour); //Middleware chaining - First precheck inputs and later crete tour

router
  .route('/top-5-cheap') //Route aliasing --> Responding to 127.0.0.1:3000/api/v1/tours/top-5-cheap route request from postman
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

//-->#4.EXPORT MODULE
module.exports = router;
