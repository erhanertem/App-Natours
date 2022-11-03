//-->#0.IMPORT CORE MODULE
const { query } = require('express');
const Tour = require('../models/tourModel'); //Mongoose tour model needs to be imported here for tour controller operations.

//-->#1.ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    // console.log(req.query);
    //--->#1.BUILD QUERY
    //#1A.Primary off-scope Filtering
    const queryObj = { ...req.query }; //Create a shallow copy of the query object
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    //#1B.Secondary Advanced Filtering
    // { duration: { $gte: '5' }, difficulty: 'easy' }-->mongoDB query
    // { duration: { gte: '5' }, difficulty: 'easy' } -->queryObj output
    let queryStr = JSON.stringify(queryObj); //We change JSON obj to a string in order to add $ sign to gte, gt, lte, lt
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //b flag matches the excat objects as listed inside the (...|...|...|...) wrapped by g flag which finds multiple copies of the same element(regx global override)
    // console.log(JSON.parse(queryStr));

    //->1ST METHOD OF FILTERING DATA WITH FILTER OBJECT
    let query = Tour.find(JSON.parse(queryStr)); //mongoose find() method with filter object {}

    //->2ND METHOD OF FILTERING DATA with MONGOOSE QUERY API METHODS
    // const query = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy'); //mongoose find() method with mongoose chained filter moethods

    //--->#2.SORTING QUERY/WITH FALLBACK CRITERIA
    //127.0.0.1:3000/api/v1/tours?sort=price               --> sort by price as fired from postman have re.query return -> { sort: 'price' } - ascending order
    //127.0.0.1:3000/api/v1/tours?sort=-price               --> sort by price as fired from postman have re.query return -> { sort: 'price' } - descending order
    //127.0.0.1:3000/api/v1/tours?sort=price,ratingAverage --> sort by price then if its a tie sort by ratingAverage as a fallback sort criteria --> { sort: 'price,ratingAverage' } - ascending order
    //127.0.0.1:3000/api/v1/tours?sort=price,-ratingAverage --> sort by price then if its a tie sort by ratingAverage as a fallback sort criteria --> { sort: 'price,ratingAverage' } - descending order ratingAvg
    //127.0.0.1:3000/api/v1/tours?sort=-price,-ratingAverage --> sort by price then if its a tie sort by ratingAverage as a fallback sort criteria --> { sort: 'price,ratingAverage' } - descending order ratingAvg & price
    if (req.query.sort) {
      //if request includes sort field ..then....
      const sortBy = req.query.sort.split(',').join(' ');
      // console.log(sortBy);
      query = query.sort(sortBy); //mongoose query sort() method ascending order
      // query = query.sort('-' + req.query.sort); //mongoose query sort() method descending order
    } else {
      // 127.0.0.1:3000/api/v1/tours --> if the user do not specify any sorting criteria sort by createdAt in desc order so that newer ones appears first
      query = query.sort('-createdAt');
    }

    //--->#3.FIELD LIMITING
    //127.0.0.1:3000/api/v1/tours?fields=name,duration,difficulty,price --> include only these information fields
    //127.0.0.1:3000/api/v1/tours?fields=-name,-duration,-difficulty,-price --> exclude only these information fields

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v'); //exclude this field - mongoDB by default internally uses this __v field for its operations which is of no use to end-user.
    }

    //--->#4.PAGINATION
    //127.0.0.1:3000/api/v1/tours?page=2&limit=10 --> page 1 (1-10) , page 2 (11-20), page 3 (21-30)

    const page = +req.query.page || 1; //we stringfy the number input for the page query property
    const limit = +req.query.limit || 100; //we stringfy the number input for the limit query property
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    //GUARD CLAUSE
    if (req.query.page) {
      const numTours = await Tour.countDocuments(); //mongoose model api function that counts all the available docs in a database collection
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    //EXECUTE QUERY
    const tours = await query;

    //SEND SUCCESS RESPONSE
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
