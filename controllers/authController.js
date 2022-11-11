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
  const user = await User.findOne({ email }).select('+password'); //Find the typed-in user from the database and retrieve its hashed password along with it if it exists...
  console.log(user);
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
  const token = signToken(user._id);

  res.status(200).json({ status: 'success', token });
});
