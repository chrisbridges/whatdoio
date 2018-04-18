const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');
const jwtStrategy = require('../../auth/strategies');

const {User} = require('../models');

passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', {session: false});

router.get('/', (req, res, next) => {
  if (req.get('Content-Type') !== 'application/json') {
    return res.sendFile('user.html', { root: path.join(__dirname, '../../public') });
  }
  next();
}, jwtAuth, (req, res) => {
    //console.log(req.user, req.header);
    User.findById(req.user._id)
      .then(user => {
        res.json(user.serialize());
      })
      .catch(err => {
        console.error(err);
		  	res.status(500).json({message: 'Internal server error'});
      });
      //send back serialized user info and process bills client-side
  //use jwtAuth middleware, if authorized, display data
    //else, access denied
  // respond with user data
});

// determine route by content type 
  // text/html would lead to html
  // applicaiton/json would return user data

// TODO: add endpoint for users to add bills
// TODO: add endpoint for users to delete bills
// TODO STRETCH: add endpoint for users to edit bills

router.get('/logout', (req, res) => {
  //remove token from local storage - CLIENT-SIDE

  // is this the way I do every other redirect?
    // or can i use res.redirect now because the token is in local storage?
  res.sendFile('logout.html', { root: path.join(__dirname, '../../public') });
});

module.exports = router;