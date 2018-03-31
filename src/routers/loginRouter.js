const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router();
const {User} = require('../models');
const path = require('path');

router.get('/', (req, res) => {
  res.sendFile('login.html', { root: path.join(__dirname, '../../public') });
});

 

module.exports = router;