const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router();
const {User} = require('../models');
const path = require('path');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {JWT_SECRET, JWT_EXPIRY} = require('../../config');
const jwtStrategy = require('../../auth/strategies');

router.get('/', (req, res) => {
  res.sendFile('login.html', { root: path.join(__dirname, '../../public') });
});

const createAuthToken = function(user) {
	return jwt.sign({user}, JWT_SECRET, {
		subject: user.username,
		expiresIn: JWT_EXPIRY,
		algorithm: 'HS256'
	});
};

router.post('/', jsonParser, (req, res) => {
  return User.findOne({username: req.body.username})
		.then(user => {
			if (!user) {
				return res.status(404).json({message: 'username not found', location: 'username'});
			}
			const passwordIsValid = user.validatePassword(req.body.pass);
			if (!passwordIsValid) {
				return res.status(401).json({message: 'username or password incorrect'});
			}
			const authToken = createAuthToken(user);
			res.json({authToken});
		})
		.catch(err => {
			// console.error(err);
			return res.status(500).json({message: 'Internal server error'});
		});
});

passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', {session: false});

// The user exchanges a valid JWT for a new one with a later expiration
router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({authToken});
});

module.exports = router;