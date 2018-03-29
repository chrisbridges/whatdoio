'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userDataSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true},
  pass: {type: String, required: true},
  name: {type: String, required: true},
  bills: [{
    from: {type: Array, required: true},
    for: {type: Array, required: true},
    recurring: {type: Boolean, required: true},
    title: {type: String, required: true},
    amount: {type: Number},
    interval: {
      //default: null,
      daily: Boolean,
      weekly: {
        dueDay: String
      },
      monthly: {
        dueDate: Number
      },
      yearly: {
        monthDue: String,
        dueDate: Number
      }
    }
  }]
});

userDataSchema.methods.serialize = function () {
  return {
    id: this._id,
    username: this.username,
    name: this.name
  };
};

const User = mongoose.model('User', userDataSchema);

module.exports = {User};