//-->#0.IMPORT CORE MODULE
const { query } = require('express');

const APIFeatures = require('../utils/apiFeatures.js');
const Tour = require('../models/tourModel.js'); //Mongoose tour model needs to be imported here for tour controller operations.

//-->#1.ROUTE HANDLERS

//->A MIDDLEWARE THAT MANIPULATES THE REQ BEFORE SENT TO GETALLTOURS ROUTE HANDLER...
// 127.0.0.1:3000/api/v1/tours?limit=5&sort=-ratingsAverage,price --> custom route handling for listing 5 highest rated desc order and pricing asc order tours
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //EXECUTE QUERY
    // console.log('🎁', req.query);
    // console.log('🧨', Tour.find(), '🧨');
    const features = new APIFeatures(Tour.find(), req.query) //(query object, express query string)
      .filter()
      .sort()
      .limitFields()
      .paginate(); //create an instance of APIFeatures class
    const tours = await features.query;

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
      runValidators: true, // IMPORTANT We tell that the validators should be run again as prescribed in the tourmodel.js (tourschema). Any incompliant data would trigger err.
    }); //mongoose findByIdAndUpdate() query method ..options are in mongoose api...

    //PATCH RESPONSE
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
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

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $gte: 4.5 } },
      }, //match pipeline stage
      {
        $group: {
          // _id: null,
          // _id: '$difficulty', //group by difficulty field types
          _id: { $toUpper: '$difficulty' }, //group by difficulty field types with uppercase operator
          // _id: '$ratingAverage', //group by difficulty field types
          numTours: { $sum: 1 }, //for each count 1 added
          numRatings: { $sum: '$ratingQuantity' },
          avgRating: { $avg: '$ratingAverage' }, //i.e. groups by no specific field (_id: null) [this got to be mentioned first in $group method] - Lets assign a new field which takes the average of ratingsAverage field of the documents and more if needed....
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      }, //group pipeline stage
      {
        $sort: { avgPrice: 1 }, //1 for ascending order for the output of the group pipeline operator....whatever field available we sort that!!!
      }, //sort pipeline stage
      {
        $match: {
          _id: { $ne: 'EASY' }, //EXCLUDE EASY FROM THE OUTPUT with not equal operator..
        },
      }, //match pipeline stage
    ]);

    res.status(200).json({ status: 'success', data: { stats } });
  } catch (err) {
    res
      .status(404)
      .json({ status: 'fail', message: 'Problem with the data provided' });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    // console.log(req.params);
    const year = req.params.year * 1; // 2021 --- loook up to route --> router.route('/monthly-plan/:year').ge.....

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      }, //unwind stage --> unrar all the startDates arrays in the documents...
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      }, //match stage , filter only the ones that fall in the year 2021
      {
        $group: {
          _id: { $month: '$startDates' }, //$month is a mongoDB aggregation operator
          numTourStarts: { $sum: 1 }, //calc the number of tours @ that month
          tours: { $push: '$name' }, //include the name of the tours
        },
      },
      {
        $addFields: { month: '$_id' }, //We add a field by the name month and takes the value of the _id which reprensented the month...
      },
      {
        $project: {
          _id: 0, //_id do not show on the output....
        },
      }, //lets get rid of the _id field from the output
      {
        $sort: { numTourStarts: -1 }, //descending order by numTourStarts....
      },
      {
        $limit: 6, //limits the output to only 6 docs...
      },
    ]);

    res.status(200).json({ status: 'success', data: { plan } });
  } catch (err) {
    res
      .status(404)
      .json({ status: 'fail', message: 'Problem with the data provided' });
  }
};
