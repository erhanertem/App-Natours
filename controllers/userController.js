//-->#1.IMPORT CORE MODULE
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//-->#2.HELPER FUNCTIONS
const filterObj = (reqBody, ...allowedFields) => {
  const newObj = new Object();
  Object.keys(reqBody).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = reqBody[el];
  });
  return newObj;
};

//-->#3.ROUTE HANDLERS
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
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
  const user = Object.assign(req.user, filteredReqBody);
  await user.save({ validateModifiedOnly: true }); //save with validators with no exceptions
  // console.log('🎀', req.user, '🎁', req.body);
  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
}); //Let the user update his own data

exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};
exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};
exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};
exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};
