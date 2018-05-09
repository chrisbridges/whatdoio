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
	let user;
  return User.findOne({username: req.body.username})
		.then(_user => {
			user = _user;
			if (!user) {
				return Promise.reject({
					code: 404,
					message: 'username not found',
					location: 'username'
				});
				// return res.status(404).json({message: 'username not found', location: 'username'});
			}
			return user.validatePassword(req.body.pass);
		})
		.then(passwordIsValid => {
			if (!passwordIsValid) {
				return Promise.reject({
					code: 401,
					message: 'username or password incorrect'
					// location: 'username'
				});
				// return res.status(401).json({message: 'username or password incorrect'});
			}
			const authToken = createAuthToken(user.serialize());
			return res.json({authToken});
		})
		.catch(err => {
			return res.status(err.code).json(err);
			// console.error(JSON.stringify(err));
			// res.status(500).json({message: 'Internal server error'});

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