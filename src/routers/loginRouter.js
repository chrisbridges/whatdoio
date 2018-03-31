const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router();
const {User} = require('../models');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {JWT_SECRET} = require('../../config');

router.get('/', (req, res) => {
  res.sendFile('login.html', { root: path.join(__dirname, '../../public') });
});

router.post('/', (req, res) => {
	let user;
  return User.findOne({username: req.body.username})
		.then(_user => {
			user = _user;
			if (!user) {
				return Promise.reject({
          code: 404,
          message: 'Username not found',
          location: 'username'
        });
			}
			return bcrypt.compareSync(req.body.pass, user.pass);
		})
		.then(passwordIsValid => {
			if (!passwordIsValid) {
				return Promise.reject({
					code: 401,
					message: 'username or password incorrect'
				});
			}
			const token = jwt.sign({id: user._id}, JWT_SECRET);
			res.status(200).send({auth: true, token: token});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({code: 500, message: 'Internal server error'});
		});
});
 

module.exports = router;