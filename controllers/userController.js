//-->#1.IMPORT CORE MODULE
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//-->#2.HELPER FUNCTIONS
const filterObj = (reqBody, ...allowedFields) => {
  const newObj = {};
  Object.keys(reqBody).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = reqBody[el];
  });
  return newObj;
};

//-->#3.ROUTE HANDLERS
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}; //We manually assign the log in id and assign as params id to be used in getUser input

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);

  //->#1.Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  //->#2.Update user document
  // console.log('🎀', req.user, '🎁', req.body);
  // const { name } = req.body;
  // const user = Object.assign(
  //   req.user,
  //   JSON.parse(JSON.stringify({ name, email, photo }))
  // );
  const filteredReqBody = filterObj(req.body, 'name', 'email'); //Allow only name and email to be passed onto user data for updating
  //->#1.Alternate code
  const user = Object.assign(req.user, filteredReqBody);
  await user.save({ validateModifiedOnly: true }); //save with validators with no exceptions
  // //->#2.Alternate code
  // const user = await User.findByIdAndUpdate(req.user.id, filteredReqBody, {
  //   new: true, //return the modified document
  //   runValidators: true,
  // });
  // console.log('🎀', req.user, '🎁', req.body);
  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
}); //Let the user update his own data

exports.deleteMe = catchAsync(async (req, res, next) => {
  // //->#1.Alternate code
  // const user = Object.assign(req.user, { active: false });
  // await user.save({ validateModifiedOnly: true }); //save with validators with no exceptions
  //->#2.Alternate code
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null, //we send no data when deleting user
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   //SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     requestedAt: req.requestTime,
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User, 'deleteUser_Reviews');
