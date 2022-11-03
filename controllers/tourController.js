//-->#0.IMPORT CORE MODULE
const { query } = require('express');
const Tour = require('../models/tourModel'); //Mongoose tour model needs to be imported here for tour controller operations.

//-->#1.ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    //BUILD QUERY
    const queryObj = { ...req.query }; //Create a shallow copy of the query object
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    console.log(req.query, queryObj);

    //--->1ST METHOD OF FILTERING DATA WITH FILTER OBJECT
    const query = Tour.find(queryObj); //mongoose find() method with filter object {}

    //--->2ND METHOD OF FILTERING DATA with MONGOOSE QUERY API METHODS
    // const query = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy'); //mongoose find() method with mongoose chained filter moethods

    //EXECUTE QUERY
    const tours = await query;

    //SUCCESS RESPONSE
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

exports.getTour = async (req, res) => {
  try {
    //->findOne() mongoose method
    // const tour = await Tour.findOne({ _id: req.params.id });
    //->findbyId() mongoose shorthand method
    const tour = await Tour.findById(req.params.id); //@tourRoutes we had .route('/:id') which should be matched by req.params.id here....If it was name then this should print name too...params is an express.js method for responding named route mapping

    //SUCCESS RESPONSE
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: "Can't reach to server" });
  }
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
    res.status(400).json({ status: 'fail', message: [err, err.message] });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //if the replacement document is any different than the original document. go ahed and replace it
      runValidators: true, // we tell that the validators shoul,d be run again as prescribed in the tourmodel.js. Any incompliant data would trigger err.
    }); //mongoose findByIdAndUpdate() query method ..options are in mongoose api...

    //PATCH RESPONSE
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res
      .status(404)
      .json({ status: 'fail', message: 'Problem with the data provided' });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndRemove(req.params.id);

    //DELETE RESPONSE
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res
      .status(404)
      .json({ status: 'fail', message: 'Problem with the data provided' });
  }
};
