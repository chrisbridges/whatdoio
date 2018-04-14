const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');
const jwtStrategy = require('../../auth/strategies');

const {User} = require('../models');

passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', {session: false});

router.get('/', jwtAuth, (req, res) => {
  console.log(req.user);
  if (req.get('Content-Type') !== 'application/json') {
    res.sendFile('user.html', { root: path.join(__dirname, '../../public') });
  } else {
    User.findById(req.user._id)
      .then(user => {
        res.json(user.serialize());
      })
      .catch(err => {
        console.error(err);
		  	res.status(500).json({message: 'Internal server error'});
      });
      //send back serialized user info and process bills client-side
  }
  //use jwtAuth middleware, if authorized, display data
    //else, access denied
  // respond with user data
});

// determine route by content type 
  // text/html would lead to html
  // applicaiton/json would return user data

module.exports = router;