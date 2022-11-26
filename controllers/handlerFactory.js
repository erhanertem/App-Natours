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
