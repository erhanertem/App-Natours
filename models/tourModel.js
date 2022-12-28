//-->IMPORT CORE MODULES
const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

//-->IMPORT 3RD PARTY MODULES
// const User = require('./userModel');

//->CREATE A BASIC MONGOOSE SCHEMA
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //it is one of the validators available to use thru mongoose
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal 40 characters'], //its a built-in validator available on strings
      minlength: [10, 'A tour name must have more or equal 10 characters'],
      // validate: validator.isAlpha, //without err message
      // validate: [
      //   validator.isAlpha,
      //   'Tour names should only contain characters',
      // ], //validator library validation with custom err message
    },
    slug: String, //MONGOOSE PRE DOCUMENT MIDDLEWARE PROPERTY
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour mush have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Diffuculty is either: easy, medium,difficult',
      }, //its a built-in validator available on strings for limiting options with an array of strings
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'], //its a built-in validator available on both numbers and dates
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10, //Each time a value is set to this value , this function is run
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (priceValue) {
          // VERY IMPORTANT this only points to current doc on NEW document creation..
          return priceValue < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    }, //doc field with custom validator setup
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], //images shall include an array of strings, not a single string
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // field limiting by default (permenantly hides from the output...so the client.can not see it.)
    },
    startDates: [Date], //in order to have different start dates for the same tour
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'], //only option / MongoDB supports the GeoJSON object types namely: Point, LineString, Polygon, MultiPoint, MultiLineString, and MultiPolygon
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //CHILD REFERENCING FIELD TO BE POPULATED DURING A TOUR QUERY
    guides: [
      {
        type: mongoose.ObjectId, // same as type: mongoose.Schema.ObjectId,
        ref: 'User', //inline referencing
      }, //VERY IMPORTANT! GUIDES FIELD IS JUST A CHILD REFERENCING TO ACTUAL DATA IN USER MODEL (ONLY CONTAINS THE REFERENCE)
    ], //For User, we wouldnt even need a module import..
    //Alternatingly, guides: [{ type: mongoose.Types.ObjectId, ref: 'User' }] OR guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }] OR guides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }, //SCHEMA DEFINITIONS
  {
    toJSON: { virtuals: true }, //allows virtuals to be visible to JSON convert
    toObject: { virtuals: true }, //allows virtuals to be visible to console.log
  } //SCHEMA OPTIONS for VIRTUALS -> //IMPORTANT By default, Mongoose does not include virtuals when you convert a document to JSON. Here it has to be specified by options object whether to disclose them in JSON response or console.log...
);

//ESTABLISHING CUSTOM COMPOUND INDEX FOR THE TOUR MODEL - DEALS with individual fields or all together
//NOTE: INDEXING DECISIONS ARE BASED ON USER QUERY FRENQUNECY TYPES...
tourSchema.index({ price: 1, ratingsAverage: -1 }); //name of the index price 1 stands for ASC order, -1 stands for DESC order...
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); //We are telling mongoDB to set startlocation as geospatial 2D space index

// IMPORTANT VIRTUAL PROPERTIES ARE NOT SAVED TO DATABASE TO SAVE SPACE....
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //we got to use a regular function declaration as we would need this keyword to point to tourSchema upon which we called Schema.prototype.virtual() method to declare a temporary field on the mongoose schema object.
}); //In queries the virtuals could not be used...as they re not part of the real database....They are runtime data...

//IMPORTANT VIRTUAL POPULATE: IN RESPONSE TO REVIEWMODEL BEARING PARENT REFERENCING TO THIS MODEL - Multiple reviews pointing to the same tour
tourSchema.virtual('reviews', {
  ref: 'Review', //connect to Review model - inline referencing
  foreignField: 'tour', //'tour' is the 'tour' field in reviewModel.js
  localField: '_id', // NOTE: What we are referring to tour field in the review model is referred here in this model with tour _id...
});

//--->MONGOOSE DOCUMENT MIDDLEWARE
//NOTE THERE ARE 4 TYPES OF MIDDLEWARE IN MONGOOSE: DOCUMENT, QUERY, AGGREGATE & MODEL MIDDLEWARES
//->MONGOOSE PRESAVE DOCUMENT MIDDLEWARE/HOOK - IT RUNS BEFORE .save() and .create() commands..
tourSchema.pre('save', function (next) {
  // console.log('🏀', this);
  this.slug = slugify(this.name, { lower: true });
  next(); //WE WOULD NEED THIS TO MOVE ON WITH THE NEXT MIDDLEWARE
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(
//     async userId => await User.findById(userId)
//   );
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });
// //->MONGOOSE POSTSAVE DOCUMENT MIDDLEWARE/HOOK
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//--->MONGOOSE QUERY MIDDLEWARE
//-->MONGOOSE PREFIND QUERY MIDDLEWARE/HOOK for both find & findOne Tours
//NOTE THIS MIDDLEWARE APPLIES BEFORE const tours = await features.query; @ tourcontroller.js GETS EXECUTED...WE FILTEROUT A SPECIFIC CRITERIA BEFORE features.query execution...
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); //this points to our query object

  this.start = Date.now();
  next();
}); //Regxpression here says that apply to any that starts with find which would include 'find', 'findOne' , etc..
// //->MONGOOSE PREFIND QUERY MIDDLEWARE/HOOK
// tourSchema.pre('find', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// }); //NOTE THIS MIDDLEWARE APPLIES BEFORE const tours = await features.query; @ tourcontroller.js GETS EXECUTED...WE FILTEROUT A SPECIFIC CRITERIA BEFORE features.query execution...
// //->MONGOOSE PREFIND QUERY MIDDLEWARE/HOOK
// tourSchema.pre('findOne', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// }); //NOTE THIS MIDDLEWARE APPLIES BEFORE const tours = await features.query; @ tourcontroller.js GETS EXECUTED...WE FILTEROUT A SPECIFIC CRITERIA BEFORE features.query execution...
//-->MONGOOSE POSTFIND QUERY MIDDLEWARE/HOOK
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds!`);
  // console.log(this);
  // console.log(docs);
  next();
});
//-->MONGOOSE PREFIND QUERRY MIDDLEWARE/HOOK for populating child references in the Tour schema in order to make it available for getAlltours and getTour querry middlewares
tourSchema.pre(/^find/, function (next) {
  // this.populate('guides'); //VERY IMPORTANT: BY POPULATING 'GUIDES' FIELD IN A TOUR, THE REFERENCED DATA IS ACTUALLY FILLED IN BY USING THE REFERENCE IN THE TOUR SCHEMA
  this.populate({
    path: 'guides', //use guides field for fillup
    select: '-__v -passwordChangedAt', //get rid of excess info on the returned response
    match: { role: 'guide' }, //filter only peep with 'guide role...extra step!😊
  }); //mongoose document.prototype.populate()
  next();
});

//--->MONGOOSE AGGREGATION MIDDLEWARE
//NOTE: We wanted to exclude the secretTour from the aggregation pipeline..The aggregate pipeline method returns an array object. So we add to the front of the array our extra line of match pipeline stage that eliminates the data that bears secretTour true
tourSchema.pre('aggregate', function (next) {
  // console.log('🎈', this.pipeline());
  if (
    //NOTE: $geoNear Tour aggregate @ tourcontroller.js gets into aggregation pipeline. so we selectively priotize $geoNear which needs to be per MongoDB
    !Object.values(this.pipeline()).some(el =>
      String(Object.keys(el) === '$geoNear')
    )
  ) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  }
  // console.log('🥇', this.pipeline()); //<this> points out to aggregation object
  next();
});

//->CREATE A MODEL OUT OF THE CREATED SCHEMA
const Tour = mongoose.model('Tour', tourSchema); //Create a collection in the database to upload data per the schema

module.exports = Tour; //Since we want to export only Tour, we use default module.exports for exporting
