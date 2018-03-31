const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router();
const {User} = require('../models');

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

 

module.exports = router;