//-->#0.IMPORT CORE MODULE
const Tour = require('./../models/tourModel'); //Mongoose tour model needs to be imported here for tour controller operations.

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    //req.body contains key-value pairs of data submitted in the request body.
    return res
      .status(400)
      .json({ status: 'fail', message: 'Missing name or price' });
  }
  next();
};

//-->#1.ROUTE HANDLERS
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
  });
};

exports.getTour = (req, res) => {
  //SUCCESS RESPONSE
  res.status(200).json({
    status: 'success',
  });
};

exports.createTour = (req, res) => {
  //SUCCESS RESPONSE
  res.status(201).json({ status: 'success', data: { tour: newTour } });
};

exports.updateTour = (req, res) => {
  //PATCH RESPONSE
  res.status(200).json({
    status: 'success',
    data: { tour: '<Updated tour here...>' },
  });
};

exports.deleteTour = (req, res) => {
  //DELETE RESPONSE
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
