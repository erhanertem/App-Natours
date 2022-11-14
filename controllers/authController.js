// const util = require('util');
const { promisify } = require('util'); //We owuld only need the promisify function from the util
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id =>
  // jwt.sign({ id: id }, process.env.JWT_SECRET, {
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  }); //payload,secretkey,{option}

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body); //VERY IMPORTANT! USING re.body AS AN INPUT ENTAILS SECURITY PROBLEM.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // }); //payload,secretkey,{option}
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
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
  console.log('🎪', user);
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
  const token = signToken(user._id); //(Synchronous) Returns the JsonWebToken as string

  res.status(200).json({ status: 'success', token });
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
