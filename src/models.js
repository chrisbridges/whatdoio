'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcryptjs');


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

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.pass);
};

userSchema.statics.hashPassword = function(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

const User = mongoose.model('User', userSchema);

module.exports = {User};