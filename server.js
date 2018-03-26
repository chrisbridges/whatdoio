const express = require('express');
const app = express();
const morgan = require('morgan');
app.use(morgan('common'));

app.use(express.static('public'));
app.listen(process.env.PORT || 8080);

if (require.main === module) {
  app.listen(process.env.PORT || 8080, function () {
    console.info(`App listening on ${this.address().port}`);
  });
}

module.exports = {app};