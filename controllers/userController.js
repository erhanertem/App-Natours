/* eslint-disable no-console */

//-->#0.IMPORT CORE MODULE
const multer = require('multer'); //form encoding middleware which is good at handling multi-part form data

//-->#1.IMPORT CUSTOM MODULE
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//--->IMAGE UPLOAD////////////////////////
//Multer disk storage engine - {set destination, set filename (in our case we want to name like user-userId-currentTimestamp)}
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1]; //image/jpeg
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

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
// const upload = multer({ dest: 'public/img/users' }); //calling multer without options would have saved it into the memory - NOTE: body parser can not handle files so we need this middleware to deal with this problem

exports.uploadUserPhoto = upload.single('photo'); //single: as we have a single file to upload | name of the field that it would hold the item/ MONGOdb ..ALSO CORRESPONDS TO POST-MAN>PATCH~update current user data>FORM-DATA>name/photo fields...
//--->IMAGE UPLOAD/////////////////////////////

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
  // console.log(req.file);
  // console.log(req.body);

  //-->#1.Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  //-->#2.Update user document
  // console.log('🎀', req.user, '🎁', req.body);
  // const { name } = req.body;
  // const user = Object.assign(
  //   req.user,
  //   JSON.parse(JSON.stringify({ name, email, photo }))
  // );
  //->#2.1 Name and email change request thru the form
  const filteredReqBody = filterObj(req.body, 'name', 'email'); //Allow only name and email to be passed onto user data for updating
  //->#2.2 Profile image File upload
  if (req.file) filteredReqBody.photo = req.file.filename; //If multer file upload requested, multer file request filename shall be added to filteredReqBody with a photo field name that matches MongoDB field name data structure in the usermodel which is passed below as a user data and saved onto MongoDB database.
  //-->Save the changes to MongoDB thru Mongoose
  //->#1.Alternate code
  const user = Object.assign(req.user, filteredReqBody); //copy filteredobject onto req.user data
  await user.save({ validateModifiedOnly: true }); //mongoose save with validators for ones that got modified only
  // //->#2.Alternate code
  // const user = await User.findByIdAndUpdate(req.user.id, filteredReqBody, {
  //   new: true, //return the modified document
  //   runValidators: true,
  // });
  // console.log('🎀', req.user, '🎁', req.body);
  //-->Send Response
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
