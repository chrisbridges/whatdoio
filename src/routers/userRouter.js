const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/user-page.html'); //rename this to user. page is redudant
});

// determine route by content type 
  // text/html would lead to html
  // applicaiton/json would return user data

module.exports = router;