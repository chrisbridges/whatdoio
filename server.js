const express = require('express');
const app = express();
const morgan = require('morgan');
app.use(morgan('common'));

app.use(express.static('public'));
app.listen(process.env.PORT || 8080);

module.exports = {app};