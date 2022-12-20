//-->#0.IMPORT CORE MODULES
// const fs = require('fs');

//-->#1.IMPORT CUSTOM MODULES
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const Review = require('../models/reviewModel');

//->A GENERALIZED VERSION OF DELETE FOR ANY DOCUMENT
exports.deleteOne = (Model, deleteOption) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndRemove(req.params.id);
    // const document = await Model.findById(req.params.id);

    //GUARD CLAUSE
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    } //if document returns null value, create a new error object with a message and err code
    //NOTE: We use return here so that we can terminate immediately otherwise the code will run along.
    /*

Moreover on this issue, it would be logical to implement two scenarios: 
1. Deleting reviews pertinent to a DELETED user.
If the reviews of a user are not deleted the user field of review is tagged null. 
2. Deleting reviews pertinent to a DELETED tour.

*/
    if (deleteOption === 'deleteTour_Reviews') {
      const doc = await Review.deleteMany({
        tour: { $eq: req.params.id },
      });
      console.log(doc);
    }
    if (deleteOption === 'deleteUser_Reviews') {
      const doc = await Review.deleteMany({
        user: { _id: req.params.id },
      });
      console.log(doc);
    }

    //DELETE RESPONSE
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

//->A GENERALIZED VERSION OF UPDATE FOR ANY DOCUMENT
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    //-->#1.Update the tour document
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //if the replacement document is any different than the original document. go ahed and replace it
      runValidators: true, // IMPORTANT We tell that the validators should be run again as prescribed in the tourmodel.js (tourschema). Any incompliant data would trigger err.
    }); //mongoose findByIdAndUpdate() query method ..options are in mongoose api...

    //GUARD CLAUSE
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    } //if tour returns null value, create a new error object with a message and err code
    //We use return here so that we can terminate immediately otherwise the code will run along.
    // console.log('🎁🎁🎁🎁🎁🎁🎁🎁', req.body);

    //-->#2.Send response
    res.status(200).json({
      status: 'success',
      data: { data: document },
    });
  });

//->A GENERALIZED VERSION OF CREATE FOR ANY DOCUMENT
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    // //->First way - indirect of creating mongoose document from the instance of the model obj via save() method
    // const newTour = new Tour({})
    // newTour.save()
    //->Second way - direct way of creating mongoose document from the model obj via create() method
    // Tour.create({}).then(); //promise then.... however we can go about the other way which is async..await...
    const document = await Model.create(req.body); //save the returned promise in the newTour variable from the request data which is req.body
    //SUCCESS RESPONSE
    res.status(201).json({ status: 'success', data: { data: document } });
  });

//->A GENERALIZED VERSION OF GETALL FOR ANY DOCUMENT
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    //Get all reviews - To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }; //APPLIES FILTER IF REVIEWROUTER CATCHES ANY MERGED PARAMS FROM TOURROUTER - GET ALLREVIEWS FOR A TOUR ROUTE

    //EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query) //(query object, express query string)
      .filter()
      .sort()
      .limitFields()
      .paginate(); //create an instance of APIFeatures class
    const document = await features.query;
    // const document = await features.query.explain(); //query.explain() method is a verbose mode which yields some statistics, and returns the query as well.

    //SEND SUCCESS RESPONSE
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: document.length,
      data: {
        data: document,
      },
    });
  });

//->A GENERALIZED VERSION OF GET FOR ANY DOCUMENT
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    //Check if populateOptions does exist - if not push in bare query else add populate options to get genberal coverage
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    //->findOne() mongoose method
    // const tour = await Tour.findOne({ _id: req.params.id });
    //->findbyId() mongoose shorthand method
    const document = await query; //@tourRoutes we had .route('/:id') which should be matched by req.params.id here....If it was name then this should print name too...params is an express.js method for responding named route mapping
    // // .populate('guides'); //VERY IMPORTANT: BY POPULATING 'GUIDES' FIELD IN A TOUR, THE REFERENCED DATA IS ACTUALLY FILLED IN BY USING THE REFERENCE IN THE TOUR SCHEMA
    // .populate({
    //   path: 'guides', //use guides field for fillup
    //   select: '-__v -passwordChangedAt', //get rid of excess info on the returned response
    //   match: { role: 'guide' }, //filter only peep with 'guide role...extra step!😊
    // }); //mongoose document.prototype.populate() //NOTE: WE MOVED ALL STUFF INTO TOURMODEL QUERRY MIDDLEWARE
    // .populate(populateOptions); //points to tourschema virtual 'reviews' for virtual populate

    //GUARD CLAUSE
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    } //if tour returns null value, create a new error object with a message and err code.
    //We use return here so that we can terminate immediately otherwise the code will run along.

    //SUCCESS RESPONSE
    res.status(200).json({
      status: 'success',
      data: { data: document },
    });
  });
