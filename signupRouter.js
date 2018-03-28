const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/signup.html');
});

// look at blogpost post end point for help
router.post('/', (req, res) => {
  const requiredFields = ['username', 'pass', 'name'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(404).send(message);
    }
  }

  User.create({
    username: req.body.username,
    pass: req.body.pass,
    name: req.body.name
  })
  .then(newUser => {
    res.status(201).json(newUser.serialize());
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({error: 'Something went wrong'});
  });
});

module.exports = router;