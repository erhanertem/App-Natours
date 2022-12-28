const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId, // same as type: mongoose.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must beloing to a Tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId, // same as type: mongoose.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'tour', select: 'name' }); //Find the user data, the tour selected and its name pre populated when find***  operation by admin, etc. is conducted...
  next();
}); //Will not often happen, since only admin, guides and tour leaders are allowed to do this....

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
