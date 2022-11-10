//-->IMPORT 3RD PARTY MODULE
const mongoose = require('mongoose');
const validator = require('validator');

//->CREATE A BASIC MONGOOSE SCHEMA FOR USERS
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //custom validator that checks if password input is equal to confirm password input..
      //NOTE: THIS ONLY WORKS ON CREATE AND SAVE!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are no the same.',
    },
  },
});

//->CREATE A MODEL OUT OF THE CREATED SCHEMA FOR A USER
const User = mongoose.model('User', userSchema);

module.exports = User;
