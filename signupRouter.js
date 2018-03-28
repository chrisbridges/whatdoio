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
  const requiredFields = ['username', 'pass', 'name'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

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