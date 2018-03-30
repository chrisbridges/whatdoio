const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {User} = require('./models');

app.use(bodyParser.json());
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/signup.html');
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

  //see if user already exists / name is already taken
    //create user if unique and hash password
      //look at 'Authenticating with JWS' curriculum for example glitch
  User.create({
    username: req.body.username,
    pass: req.body.pass,
    name: req.body.name
  })
  .then(newUser => {
    res.status(201).json(newUser.serialize());
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({error: 'Something went wrong'});
  });

});

module.exports = router;