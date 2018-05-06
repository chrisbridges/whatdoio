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
    User.findById(req.user._id)
      .then(user => {
        res.status(200).json(user.serialize());
      })
      .catch(err => {
        console.error(err);
		  	res.status(500).json({message: 'Internal server error'});
      });
});

router.post('/:userID/bills', jwtAuth, (req, res) => {

  User.findByIdAndUpdate(
    req.user._id,
    {$push: {bills: req.body}},
    {safe: true, upsert: true, new: true}) // new makes the promise return the user with the new bill
    .then(user => {
      res.json(user.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Trouble adding bill'});
    });
});

router.delete('/:userID/bills/:billID', jwtAuth, (req, res) => {
  const {userID, billID} = req.params;
  let user;
  User.findById(userID)
    .then(_user => {
      user = _user;
      user.deleteBill(billID);
      res.json(user.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Trouble deleting bill'});
    });
});

router.put('/:userID/bills/:billID', jwtAuth, (req, res) => {
  const {userID, billID} = req.params;
  // cleansing the data, only using the updated object
  const updated = {};
  const updateableFields = ['title', 'from', 'for', 'amount', 'recurring', 'dueDate', 'interval'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[`bills.$.${field}`] = req.body[field];
    }
  });

  User.update({'bills._id': billID}, {$set: updated}, {new: true})
    .then(() => {
      return User.findById(userID);
    })
    .then(user => {
      res.json(user.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Trouble deleting bill'});
    });
});

router.get('/logout', (req, res) => {
  return res.sendFile('logout.html', { root: path.join(__dirname, '../../public') });
});

module.exports = router;