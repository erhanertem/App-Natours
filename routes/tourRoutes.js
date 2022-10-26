//-->#0.IMPORT CORE MODULE
const express = require('express');

//-->#1.IMPORT CUSTOM MODULE
const tourController = require('../controllers/tourController');

//-->#2.CREATE CHILD ROUTER
const router = express.Router();

//-->#3.CUSTOM MIDDLEWARE
router.param('id', tourController.checkID); //NOTE: SINCE THIS EXPRESS ROUTER METHOD(KINDA MIDDLEWARE) IS MADE AVAILABLE LOCALLY, IT CAN'T BE ASSESSED BY USERS....IT SIMPLY ACTS AS A LOCAL SUB APP. CHECKS AUTOMATICALLY 'ID' PARAMETER @ .route('/:id') INPUT WHETHER ITS VALID OR NOT..

//-->#3.DEFINE ROUTES
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

//-->#4.EXPORT MODULE
module.exports = router;
