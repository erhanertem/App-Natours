//-->IMPORT 3RD PARTY MODULE
const mongoose = require('mongoose');
const slugify = require('slugify');

//->CREATE A BASIC MONGOOSE SCHEMA
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
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
    },

    ratingAverage: { type: Number, default: 4.5 },
    ratingQunatity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: Number,
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
  }, //SCHEMA DEFINITIONS

  {
    toJSON: { virtuals: true }, //allows virtuals to be visible to JSON convert
    toObject: { virtuals: true }, //allows virtuals to be visible to console.log
  } //SCHEMA OPTIONS -> //IMPORTANT By default, Mongoose does not include virtuals when you convert a document to JSON. Here it has to be specified by options object whether to disclose them in JSON response or console.log...
);

// IMPORTANT VIRTUAL PROPERTIES ARE NOT SAVED TO DATABASE TO SAVE SPACE....
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //we got to use a regular function declaration as we would need this keyword to point to tourSchema upon which we called Schema.prototype.virtual() method to declare a temporary field on the mongoose schema object.
}); //In queries the virtuals could not be used...as they re not part of the real database....They are runtime data...

//--->MONGOOSE DOCUMENT MIDDLEWARE
//NOTE THERE ARE 4 TYPES OF MIDDLEWARE IN MONGOOSE: DOCUMENT, QUERY, AGGREGATE & MODEL MIDDLEWARES
//->MONGOOSE PRESAVE DOCUMENT MIDDLEWARE/HOOK - IT RUNS BEFORE .save() and .create() commands..
tourSchema.pre('save', function (next) {
  // console.log('🏀', this);
  this.slug = slugify(this.name, { lower: true });
  next(); //WE WOULD NEED THIS TO MOVE ON WITH THE NEXT MIDDLEWARE
});
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
  this.find({ secretTour: { $ne: true } }); //this points to our request

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
  // console.log(tourSchema);
  console.log(docs);
  next();
});

//->CREATE A MODEL OUT OF THE CREATED SCHEMA
const Tour = mongoose.model('Tour', tourSchema); //Create a collection in the database to upload data per the schema

module.exports = Tour; //Since we want to export only Tour, we use default module.exports for exporting
