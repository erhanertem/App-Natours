//-->#0.IMPORT CORE MODULES
const fs = require('fs');
// const { query } = require('express');
const multer = require('multer'); //form encoding middleware which is good at handling multi-part form data
const sharp = require('sharp'); // for resizing or reformatting images

//-->#1.IMPORT CUSTOM MODULES
const Tour = require('../models/tourModel'); //Mongoose tour model needs to be imported here for tour controller operations.
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//--->IMAGE UPLOAD////////////////////////

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true); //no error , proceed - true
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false); //err-throw one, do not proceed - false
  }
}; //NOTE: For common mimetypes refer to https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]); //NOTE: Multer provides either .array() or .fields() methods for uploading multiple files on contrary to .single() for single uploads. Difference between array() and fields() methods is array() takes in array of same kind files, and fields for accepting a mix of array files of different group.
//upload.single('image') --> produces req.file
//upload.array('images',5) --> produces req.files
//upload.fields([{...}, {...}]) --> produces req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);

  //GUARD CLAUSE
  if (!req.files.imageCover && !req.files.images) return next();

  //->Deleting the old tour images
  const tour = await Tour.findById(req.params.id);
  if (
    tour.images.length > 0 &&
    fs.existsSync(`public/img/tours/${tour.images[0]}`)
  ) {
    tour.images.forEach(image => {
      fs.unlinkSync(`public/img/tours/${image}`);
    });
  }
  if (tour.imageCover && fs.existsSync(`public/img/tours/${tour.imageCover}`)) {
    fs.unlinkSync(`public/img/tours/${tour.imageCover}`);
  }

  //->Cover image
  if (req.files.imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer) //Per multer API, <buffer> key is only available in req.file for memorystorage(). Its the file information kept in the memory by multer
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);
  }

  //->Tour Images - Loop the array of images
  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, index) => {
        //map() creates a new array of async operations which each yields a promise and in order to get all the promises, promise.all() is required. Promise.all() is a final promise we got to wait on
        const filename = `tour-${req.params.id}-${Date.now()}-${
          index + 1
        }.jpeg`;
        await sharp(file.buffer) //Per multer API, <buffer> key is only available in req.file for memorystorage(). Its the file information kept in the memory by multer
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
      })
    );
  }

  next(); //--> req.body.image got sends to updateTour>factory.updateOne...to update MongoDB image field of the tour with corresponding tour.id
});
//--->IMAGE UPLOAD/////////////////////////////

//-->#1.ROUTE HANDLERS

//->A MIDDLEWARE THAT MANIPULATES THE REQ BEFORE SENT TO GETALLTOURS ROUTE HANDLER...
// 127.0.0.1:3000/api/v1/tours?limit=5&sort=-ratingsAverage,price --> custom route handling for listing 5 highest rated desc order and pricing asc order tours
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query) //(query object, express query string)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate(); //create an instance of APIFeatures class
//   const tours = await features.query;

//   //SEND SUCCESS RESPONSE
//   res.status(200).json({
//     status: 'success',
//     requestedAt: req.requestTime,
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = factory.getOne(Tour, 'reviews'); //Alternate if only one populate option
// exports.getTour = catchAsync(async (req, res, next) => {
//   //->findOne() mongoose method
//   // const tour = await Tour.findOne({ _id: req.params.id });
//   //->findbyId() mongoose shorthand method
//   const tour = await Tour.findById(req.params.id) //@tourRoutes we had .route('/:id') which should be matched by req.params.id here....If it was name then this should print name too...params is an express.js method for responding named route mapping
//     // // .populate('guides'); //VERY IMPORTANT: BY POPULATING 'GUIDES' FIELD IN A TOUR, THE REFERENCED DATA IS ACTUALLY FILLED IN BY USING THE REFERENCE IN THE TOUR SCHEMA
//     // .populate({
//     //   path: 'guides', //use guides field for fillup
//     //   select: '-__v -passwordChangedAt', //get rid of excess info on the returned response
//     //   match: { role: 'guide' }, //filter only peep with 'guide role...extra step!😊
//     // }); //mongoose document.prototype.populate() //NOTE: WE MOVED ALL STUFF INTO TOURMODEL QUERRY MIDDLEWARE
//     .populate('reviews'); //points to tourschema virtual 'reviews' for virtual populate
//   //GUARD CLAUSE
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   } //if tour returns null value, create a new error object with a message and err code.
//   //We use return here so that we can terminate immediately otherwise the code will run along.
//   //SUCCESS RESPONSE
//   res.status(200).json({
//     status: 'success',
//     data: { tour },
//   });
// });

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   // //->First way - indirect of creating mongoose document from the instance of the model obj via save() method
//   // const newTour = new Tour({})
//   // newTour.save()
//   //->Second way - direct way of creating mongoose document from the model obj via create() method
//   // Tour.create({}).then(); //promise then.... however we can go about the other way which is async..await...
//   const newTour = await Tour.create(req.body); //save the returned promise in the newTour variable from the request data which is req.body
//   //SUCCESS RESPONSE
//   res.status(201).json({ status: 'success', data: { tour: newTour } });
// });

exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true, //if the replacement document is any different than the original document. go ahed and replace it
//     runValidators: true, // IMPORTANT We tell that the validators should be run again as prescribed in the tourmodel.js (tourschema). Any incompliant data would trigger err.
//   }); //mongoose findByIdAndUpdate() query method ..options are in mongoose api...

//   //GUARD CLAUSE
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   } //if tour returns null value, create a new error object with a message and err code
//   //We use return here so that we can terminate immediately otherwise the code will run along.

//   //PATCH RESPONSE
//   res.status(200).json({
//     status: 'success',
//     data: { tour },
//   });
// });

exports.deleteTour = factory.deleteOne(Tour, 'deleteTour_Reviews');
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndRemove(req.params.id);

//   //GUARD CLAUSE
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   } //if tour returns null value, create a new error object with a message and err code
//   //We use return here so that we can terminate immediately otherwise the code will run along.

//   //DELETE RESPONSE
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    }, //match pipeline stage
    {
      $group: {
        // _id: null,
        // _id: '$difficulty', //group by difficulty field types
        _id: { $toUpper: '$difficulty' }, //group by difficulty field types with uppercase operator
        // _id: '$ratingsAverage', //group by difficulty field types
        numTours: { $sum: 1 }, //for each count 1 added
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' }, //i.e. groups by no specific field (_id: null) [this got to be mentioned first in $group method] - Lets assign a new field which takes the average of ratingsAverage field of the documents and more if needed....
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
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
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
});

// when tourroute is tours-within/distance / 233 / center / -40, 25 / unit / mi
//www.mongodb.com/docs/manual/reference/operator/query/
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude or longitude in the format lat,lng',
        400
      )
    );
  }

  // console.log(distance, lat, lng, unit);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // console.log(typeof lat, typeof lng);

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude or longitude in the format lat,lng',
        400
      )
    );
  }

  // Outputs documents in the order of nearest to farthest from a specified point.
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] }, //*1 revert strings to numbers trick!!
        distanceField: 'distance', //MEASURES IN METERS BY DEFAULT FOR SPHERICAL RADS
        distanceMultiplier: multiplier, //option to change it to kilometers/miles
      },
    },
    {
      $project: {
        //include only distance and name information
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
