const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');

const {User} = require('../models');

passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', {session: false});

router.get('/', (req, res) => {
  if (!req.is('application/json')) {
    res.sendFile('user.html', { root: path.join(__dirname, '../../public') });
  }
  //use jwtAuth middleware, if authorized, display data
    //else, access denied
  // respond with user data
});

// determine route by content type 
  // text/html would lead to html
  // applicaiton/json would return user data

module.exports = router;