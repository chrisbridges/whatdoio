const express = require('express');
const app = express();
const morgan = require('morgan');
app.use(morgan('common'));

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

if (require.main === module) {
  app.listen(process.env.PORT || 8080, function () {
    console.info(`App listening on ${this.address().port}`);
  });
}

module.exports = {app};