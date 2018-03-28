'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userDataSchena = mongoose.Schema({
  userName: {type: String, required: true, index: {unique: true}},
  password: {type: String, required: true},
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

});

const User = mongoose.model('User', userDataSchena);

module.exports = {User};