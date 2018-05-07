const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const {User} = require('../models');
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile('signup.html', { root: path.join(__dirname, '../../public') });
});

// look at blogpost post end point for help
router.post('/', (req, res) => {
  //check for missing fields in request
  const requiredFields = ['username', 'pass', 'name'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      console.error(req.body);
      return res.status(400).send(message);
    }
  }
  //check that required fields are strings
  const stringFields = ['username', 'pass', 'name'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }
  //trim username and password
    //username and pass should not start or end with space
  const explicityTrimmedFields = ['username', 'pass'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }
  //make sure username and pass are appropriate length
  const sizedFields = {
    username: {
      min: 1
    },
    pass: {
      min: 10,
      max: 72 // bycrypt max
    }
  }

  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }
  //see if user already exists / name is already taken
  let {username, pass, name} = req.body;
  name = name.trim();

  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      //create user if unique and hash password
      return User.hashPassword(pass);
    })
    .then(hash => {
      return User.create({
        username,
        pass: hash,
        name
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      // console.error(err);
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

module.exports = router;