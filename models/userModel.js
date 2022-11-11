//-->IMPORT 3RD PARTY MODULE
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    select: false, //disable to be shown on the sent-to-client responses
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

//--->MONGOOSE DOCUMENT MIDDLEWARE
//->MONGOOSE PRESAVE DOCUMENT MIDDLEWARE/HOOK - IT RUNS BEFORE .save() and .create() commands..
//ENCRYPT THE PASSWORD BEFORE SAVING PASSWORD TO DATABASE - PLAIN PASSWORDS SHOULDNT BE STORED IN THE DATABASE
userSchema.pre('save', async function (next) {
  //->Only run this function only if password was actually modified
  if (!this.isModified('password')) return next(); //WE WOULD NEED NEXT TO MOVE ON WITH THE NEXT MIDDLEWARE.. THIS REFERS TO THE CURRENT USER WE ARE CREATING, ISMODIFIED() IS A MONGOOSE DOCUMENT BOOLEAN FLAG THAT KEEPS TRACK OF CHANGES TO DOC - //VERY IMPORTANT WE DO THIS SO ANY ENCRYPTED PASSWORD DO NOT GET RE-ENCRYPTED!!!!
  //->Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //->Delete the confirm-password field
  this.passwordConfirm = undefined; //Erase this unnecessary data after the validation....Does not persist to the user database...
});

//->CREATE A MODEL OUT OF THE CREATED SCHEMA FOR A USER
const User = mongoose.model('User', userSchema);

module.exports = User;
