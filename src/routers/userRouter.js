const express = require('express');
const router = express.Router();
const path = require('path');

const {User} = require('../models');

router.get('/', (req, res) => {
  res.sendFile('user.html', { root: path.join(__dirname, '../../public') }); //rename this to user. page is redudant
});

// determine route by content type 
  // text/html would lead to html
  // applicaiton/json would return user data

module.exports = router;