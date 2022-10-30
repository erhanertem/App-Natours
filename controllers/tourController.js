//-->#0.IMPORT CORE MODULE
const Tour = require('../models/tourModel'); //Mongoose tour model needs to be imported here for tour controller operations.

//-->#1.ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find(); //mongoose find() method

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: "Can't reach to server" });
  }
};

exports.getTour = (req, res) => {
  //SUCCESS RESPONSE
  res.status(200).json({
    status: 'success',
  });
};

exports.createTour = async (req, res) => {
  try {
    // //->First way - indirect of creating mongoose document from the instance of the model obj via save() method
    // const newTour = new Tour({})
    // newTour.save()
    //->Second way - direct way of creating mongoose document from the model obj via create() method
    // Tour.create({}).then(); //promise then.... however we can go about the other way which is async..await...
    const newTour = await Tour.create(req.body); //save the returned promise in the newTour variable from the request data which is req.body

    //SUCCESS RESPONSE
    res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    //Rejected promise is sent here.
    // res.status(400).json({ status: 'fail', message: err.message });
    res.status(400).json({ status: 'fail', message: 'Invalid data sent' });
  }
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
