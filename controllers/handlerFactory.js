//-->#1.IMPORT CUSTOM MODULES
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//->A GENERALIZED VERSION OF DELETE FOR ANY DOCUMENT
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndRemove(req.params.id);

    //GUARD CLAUSE
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    } //if document returns null value, create a new error object with a message and err code
    //NOTE: We use return here so that we can terminate immediately otherwise the code will run along.

    //DELETE RESPONSE
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

//->A GENERALIZED VERSION OF UPDATE FOR ANY DOCUMENT
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //if the replacement document is any different than the original document. go ahed and replace it
      runValidators: true, // IMPORTANT We tell that the validators should be run again as prescribed in the tourmodel.js (tourschema). Any incompliant data would trigger err.
    }); //mongoose findByIdAndUpdate() query method ..options are in mongoose api...

    //GUARD CLAUSE
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    } //if tour returns null value, create a new error object with a message and err code
    //We use return here so that we can terminate immediately otherwise the code will run along.

    //PATCH RESPONSE
    res.status(200).json({
      status: 'success',
      data: { data: document },
    });
  });
