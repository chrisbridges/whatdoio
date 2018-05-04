const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');
const jwtStrategy = require('../../auth/strategies');

const {User} = require('../models');

passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', {session: false});

router.get('/', (req, res, next) => {
  console.log(req.get('Content-Type'));
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

// TODO: add endpoint for users to add bills
// endpoint name is ambiguous - creating new user?
  // "/:userID/bills"
router.post('/', jwtAuth, (req, res) => {

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

// TODO: add endpoint for users to delete bills
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
    // .then(updatedBill => res.status(204).end())
    // // .catch(err => res.status(500).json({ message: 'Trouble editing bill' }));
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
  // let user;
  // User.findById(userID)
  //   .then(_user => {
  //     user = _user;
  //     let bill = user.bills.find(function (bill) {
  //       return bill._id === billID;
  //     });
  //     console.log(bill);
  //     const billIndex = user.bills.indexOf(bill);
  //     user.bills[billIndex] = Object.assign(updated, bill);
  //     console.log(user.bills[billIndex]);
  //     return user.save();
  //     res.json(user.serialize());
  //   })
  //   .catch(err => {
  //     console.error(err);
  //     res.status(500).json({message: 'Trouble deleting bill'});
  //   });
    // find user by ID,
    // then iterate over bills to find bill I want
    // rmemebre ot bill.save && user.save()
});

router.get('/logout', (req, res) => {
  //remove token from local storage - CLIENT-SIDE

  // is this the way I do every other redirect?
    // or can i use res.redirect now because the token is in local storage?
  return res.sendFile('logout.html', { root: path.join(__dirname, '../../public') });
});

module.exports = router;