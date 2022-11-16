//-->IMPORT 3RD PARTY MODULE
const crypto = require('crypto'); //built-in node.js module
const { promisify } = require('util'); //We would only need the promisify function from the util module. // const util = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const { nextTick } = require('process');

//-->HELPER FUNCTIONS
const signToken = id =>
  // jwt.sign({ id: id }, process.env.JWT_SECRET, {
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  }); //payload,secretkey,{option}
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user, //user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body); //VERY IMPORTANT! USING re.body AS AN INPUT ENTAILS SECURITY PROBLEM.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires,
    role: req.body.role,
  });

  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // }); //payload,secretkey,{option}
  createSendToken(newUser, 201, res);
  // const token = signToken(newUser._id);
  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //->1.Check if email and password exist
  // if !(email && password) {
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  //->2.Check if user(via email) exists && password is correct
  // const user = User.findOne({email: email})
  const user = await User.findOne({ email }).select('+password'); //Find the typed-in user from the database and retrieve its hashed password along with it if it exists...(+) means include (-) means exclude. Withoud (+), user's email will be dropped and only password will be returned in the promise.
  // console.log('🎪', user);
  // We have to check if typed-in pass1234 === '$2a$12$QqRQD.PbDT3ez08SXBYsseLja98oDl4T6K7tq5Sa/yRgVbStKfcnm' password for the matching user...
  // const correct = await user.correctPassword(password, user.password); //Have bcrypt check if typed-in password checks with the one in the database...
  if (
    // !(user && (await user.correctPassword(password, user.password))) //correctPassword instance method is a async function which returns a promise which here we need to await for...
    !user ||
    !(await user.correctPassword(password, user.password)) //correctPassword instance method is a async function which returns a promise which here we need to await for...(bcrypt.compare returns boolean value so does correctPassword eventually)
  ) {
    return next(new AppError('Incorrect email or password', 401)); //NOTE: We gather the error of either an incorrect user or a password in one go which is a vague information for the hacker. Have we handle the errors seperately, hacker would have a better understanding of whats the err.
  }

  //->3.If everything ok, send token to client
  createSendToken(user, 200, res);
  // const token = signToken(user._id); //(Synchronous) Returns the JsonWebToken as string
  // res.status(200).json({ status: 'success', token });
});

exports.protect = catchAsync(async (req, res, next) => {
  //->1.Check if we have a token for access
  //NOTE: req.headers is a Web HTTP API. The headers may carry token information in either GET or POST operations. You can send the token in the body if you want, there's nothing preventing you from doing that. However, GET requests don't have a body and so the only way to send the token there is via a header or a query parameter and now on the server you'd have to check the body and the header separately depending on the route. It's better to just keep it consistent and send the token in the header.
  //IMPORTANT JWT implementation on the headers is bind by standards. As such key/value pair in the header should be 'authorization' / 'Bearer token_cryptic_code...'
  let token;
  if (
    req.headers.authorization && //if we GET a header with a key of Authorization and value starting with Bearer...
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]; //We strip Bearer from the actual JWToken string..
  }
  // console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access', 401)
    ); //We stop the user to proceed further if he is missing a token first... Token created @ login...
  }

  //->2.Verify token
  // const decoded = jwt.verify(token, process.env.JWT_SECRET); //Sync version
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //Async version - By default ( jwt.verify ) is synchronous, but we made it asynchronous by Promisifying it via node.js util library so it doesn't block the event loop as hashing tends to take a fairly significant amount of time.
  // console.log('🎁', decoded);
  //->3.Check if the user still exists(not deleted) - This stage is responsible to check if the payload is not tempered and matches the user supplied
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  //->4.Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  } //IF TRUE (PASSWORD CHANGED)

  //GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles ['admin', 'lead-guide']   .... role ='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next(); //Moveon to the next middleware
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //->#1.Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  //->#2.Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // await user.save({ validateBeforeSave: false }); //Temporarily  disables all the validators before saving the data - MONGOOSE document SAVE() method async to save all changes and get it updated on the database
  await user.save({ validateModifiedOnly: true }); //Temporarily  bypass all the validators except for the one modified before saving the data - MONGOOSE document SAVE() method async to save all changes and get it updated on the database

  //->#3.Send it to user's email
  //Create a resetURL hyperlink with
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`; //IMPORTANT! Its safe to send the resetToken before encryption. But we storted the hashed version of the token in our database to check against it.

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL} \nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email, //email:req.body.email -- same as --
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    // res
    //   .status(200)
    //   .json({ status: 'success', message: 'Token sent to email!' }); //NOTE: Response does not necessarily need to be here as all we are interested was to throw a custom error to deal with unsuccessfull email error...
  } catch (err) {
    //modify data in case of failure
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    //Save the modified data to mongoDB database
    await user.save({ validateModifiedOnly: true });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }

  res.status(200).json({ status: 'success', message: 'Token sent to email!' });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //->#1.Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex'); //We hash the token received from the user

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }); // We look into mongoDB database that matches the hashed version of the token to the hashed passwordresettoken amongst the users. If hash matches AND passwordreset expiration has not lower than the current timestamp, retieves the user.

  //->#2.If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); //save with validators with no exceptions

  //->#3.Update changedPasswordAt property for the user
  // Thru pre - save middleware @usermodel.js
  //->#4.Log the user in, send JWT
  createSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({ status: 'success', token });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //->#1.Get user from the database with its password
  console.log('🩳', req, req.user);
  const user = await User.findById(req.user.id).select('+password');

  //->#2.Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  //->#3.If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); //save with validators with no exceptions

  //->#4.Log user in, send JWT
  createSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({ status: 'success', token });
});
