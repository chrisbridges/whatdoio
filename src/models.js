'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  username: {type: String, required: true, index: {unique: true}},
  pass: {type: String, required: true},
  name: {type: String, required: true},
  bills: [{
    from: {type: Array, required: true},
    for: {type: Array, required: true},
    recurring: {type: Boolean, required: true},
    title: {type: String, required: true},
    amount: {type: Number},
    dueDate: {type: Date},
    interval: {
      type: String,
      enum: ['1d', '7d', '1m', '1y']
    }
  }]
});

userSchema.methods.serialize = function () {
  return {
    id: this._id,
    username: this.username,
    name: this.name
  };
};

const User = mongoose.model('User', userSchema);

module.exports = {User};