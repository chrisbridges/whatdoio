'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userDataSchena = mongoose.Schema({
  username: {type: String, required: true, index: {unique: true}},
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

userDataSchena.methods.serialize = function () {
  return {
    username: this.username,
    name: this.name
  };
};

const User = mongoose.model('User', userDataSchena);

module.exports = {User};