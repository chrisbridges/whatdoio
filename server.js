const express = require('express');
const app = express();
const morgan = require('morgan');
app.use(morgan('common'));
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const signupRouter = require('./signupRouter');
const loginRouter = require('./loginRouter');
const userRouter = require('./userRouter');

app.use(express.static('public'));
app.listen(process.env.PORT || 8080);

app.get('/', (req, res) => {
  res.sendFile(__dirname + 'public/index.html');
});

app.use('/signup', signupRouter);
app.use('/login', loginRouter);
app.use('/user', userRouter);

let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  app.listen(process.env.PORT || 8080, function () {
    console.info(`App listening on ${this.address().port}`);
  });
}

module.exports = {app, runServer, closeServer};