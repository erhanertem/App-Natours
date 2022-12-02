//-->IMPORT 3RD PARTY MODULE
const crypto = require('crypto'); //built-in node.js module
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date, //define token expiration timeframe for accessing resetToken
  active: {
    type: Boolean,
    default: true,
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
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next(); //IF WE DID NOT CHANGE THE PASSWORD OR THE DOCUMENT IS NEW, DO NOT MANIPULATE THE PASSWORDCHANGEDAT FIELD VALUE..ISNEW MONGOOSE DOCUMENT PROPERTY IS A BOOLEAN FLAG THAT DECLARES DOC AS NEW OR NOT

  this.passwordChangedAt = Date.now() - 1000; //ISSUING JWT TAKES SHORTER THAN SAVING TO DATABASE. IN ORDER TO AVOID INVALID TOKEN DUE TO TIMESTAMP DELAY, WE DIRTY FIX IT BY SUBSTRACTING 1s
  next();
});

userSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
}); //getAllUsers with active marked not false gets listed due to this pre-find*** middle

//--->MONGOOSE MODEL INSTANCE METHODS FOR LOGIN AUTHENTICATION (CUSTOM MONGOOSE DOCUMENT MIDDLEWARE)
//NOTE: INSTANCE METHOD ADDS A FUNCTION AND MAKES IT AVAILABLE TO ALL DOCS IN THE DATABASE
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword); //bcrypt compare function is an async Boolean output operation per its API documentation
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000; //revert to miliseconds format for comparison to JWTTimestamp
    // console.log(changedTimestamp, JWTTimestamp); //1556582400 1668416110

    //FALSE MEANS NOT CHANGED
    return JWTTimestamp < changedTimestamp; // 1668416110 < 1556582400
  }
  //FALSE MEANS NOT CHANGED
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //This creates a 64 characters long, cryptographically strong (very random) password using hexadecimal encoding (numbers 0-9, letters A-F).

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); //Update the resetToken with a sha256 hashing and then store it as a hexadecimal...
  // console.log('👚', { resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 minutes from now password token expires

  return resetToken;
}; //It creates a use with a temp password to change his password

//->CREATE A MODEL OUT OF THE CREATED SCHEMA FOR A USER
const User = mongoose.model('User', userSchema);

module.exports = User;
