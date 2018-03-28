const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/signup.html');
});

// look at blogpost post end point for help

module.exports = router;