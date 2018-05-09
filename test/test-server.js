'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
// chai.use(require('chai-things'));
const faker = require('faker');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const {JWT_SECRET, JWT_EXPIRY} = require('../config');

const {User} = require('../src/models');
const {TEST_DATABASE_URL} = require('../config');
const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;
chai.use(chaiHttp);

function randomNumberWithinRange (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function seedUserData (numberOfUsers = randomNumberWithinRange(1,5)) {
  // console.info('seeding user data');
  const seedData = [];

  // const randomNumberOfUsers = randomNumberWithinRange(1,5);
  for (let i = 0; i < numberOfUsers; i++) {
    seedData.push({
      username: faker.internet.userName(),
      pass: faker.internet.password(),
      name: faker.name.firstName(),
      bills: generateBills()
    });
  }

  return User.insertMany(seedData);
}

function generateBills (numberofBills = randomNumberWithinRange(1, 5)) {

  function addNumberSuffix (num) {
    let j = num % 10;
    let k = num % 100;
    if (j === 1 && k !== 11) {
      return num + "st";
    }
    if (j === 2 && k !== 12) {
      return num + "nd";
    }
    if (j === 3 && k !== 13) {
      return num + "rd";
    }
    return num + "th";
  }

  function generateBillInterval () {
    const intervals = ['daily', 'weekly', 'monthly', 'yearly'];
    const randomIntervalIndex = randomNumberWithinRange(0, intervals.length - 1);
    const randomInterval = intervals[randomIntervalIndex];
    return randomInterval;    
  }

  function generateBillDueDate (interval) {
    const today = new Date();
    const randomDate = randomNumberWithinRange(1, 31);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
    const randomMonth = months[randomNumberWithinRange(0, months.length - 1)];
    const currentYear = today.getFullYear();
    const randomYear = currentYear + randomNumberWithinRange(0, 19);

    if (interval === 'daily') {
      return 'Every Day';
    }
    if (interval === 'weekly') {
      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const randomWeekday = weekdays[randomNumberWithinRange(0, weekdays.length - 1)];
      return `Every ${randomWeekday}`;
    }
    if (interval === 'monthly') {
      return `${addNumberSuffix(randomDate)} of every month`;
    }
    if (interval === 'yearly') {
      return `${randomMonth} ${addNumberSuffix(randomDate)} of every year`;
    }
    return `${randomMonth} ${randomNumberWithinRange(1, 31)}, ${randomYear}`;
  }

  // for every bill, either "for" or "from" === ['Me'], the other can be anyone else
  function randomlyDecideMe () {
    const billParties = [];
    const randomMe = randomNumberWithinRange(0,1);
    billParties[randomMe] = ['Me'];

    function generateBillParties () {
      const parties = [];
      for (let i = 0; i < randomNumberWithinRange(1, 5); i++) {
        parties.push(faker.name.firstName());
      }
      return parties;
    }

    if (billParties[0]) {
      billParties[1] = generateBillParties();
    } else {
      billParties[0] = generateBillParties();
      billParties[1] = ['Me'];
    }

    return billParties;
  }

  const bills = [];
  // const randomNum = randomNumberWithinRange(1, 5);
  for (let i = 0; i < numberofBills; i++) {
    const billParties = randomlyDecideMe();
    const bill = {
      from: billParties[0],
      for: billParties[1],
      recurring: faker.random.boolean(),
      title: faker.lorem.words(),
      amount: faker.random.number()
    };
    // if recurring === true, set up intervals
    if (bill.recurring === true) {
      bill.interval = generateBillInterval();
    } else {
      bill.interval = null;
    }
    bill.dueDate = generateBillDueDate(bill.interval);
    bills.push(bill);
  }
  return bills;
}

function generateRandomUser () {
  return {
    username: faker.internet.userName(),
    pass: faker.internet.password(12), // ensure passwords are 12 characters long (10 is minimum)
    name: faker.name.firstName()
  };
}

function tearDownDB () {
  // console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Testing API', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedUserData();
  });

  afterEach(function () {
    return tearDownDB();
  });

  after(function () {
    return closeServer();
  });

  describe('should serve static assets', function() {
    it('should serve home page', function () {
      return chai
      .request(app)
      .get('/')
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(err => {
        throw err;
      });
    });

    it('should serve signup page', function() {
      return chai
      .request(app)
      .get('/signup')
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(err => {
        throw err;
      });
    });

    it('should serve login page', function() {
      return chai
      .request(app)
      .get('/login')
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(err => {
        throw err;
      });
    });

    it('should serve user page', function() {
      return chai
      .request(app)
      .get('/user')
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(err => {
        throw err;
      });
    });
  });

  describe('Sign up page', function () {
    it('should add a new user', function () {
      const randomUser = generateRandomUser();
      
      return chai.request(app)
        .post('/signup')
        .send(randomUser)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('username', 'name');
          expect(res.body.username).to.equal(randomUser.username);
          expect(res.body.name).to.equal(randomUser.name);
          
          return User.findById(res.body.id);
        })
        .then(function(user) {
          expect(user).to.not.be.null;
          expect(user.username).to.equal(randomUser.username);
          expect(user.name).to.equal(randomUser.name);

          return user.validatePassword(randomUser.pass);
        })
        .then(passwordIsCorrect => {
          expect(passwordIsCorrect).to.be.true;
        })
        .catch(err => {
          throw err;
        });

    });
  });

  describe('Login page', function () {

    const randomUser = generateRandomUser();
    const {username, pass, name} = randomUser;
    const hashedPassword = User.hashPassword(pass);
    // console.log(randomUser, hashedPassword);

    // const username = 'exampleUser';
    // const pass = 'examplePass';
    // const name = 'Example';

    beforeEach(function() {
      
      // User.hashPassword(pass)
      //   .then(hashedPassword => {
      //     return User.create({username, pass: hashedPassword, name});
      //   });
      // chai.request(app).post('/signup').send({username, pass, name}) // look into this process, because incorrect password test was passing prior
      // .then(res => {
      //   // console.log(res.body);
      // })
      // .catch(err => {
      //   // console.error(err);
      // });
      return User.create({
        username,
        pass: hashedPassword,
        name
      });
    });
  
    afterEach(function () {
      return User.remove({});
    });

    it('should accept users with proper credentials', function () {
      return chai.request(app)
        .post('/login')
        .send({username, pass})
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys('authToken');
          expect(res.body.authToken).to.be.a('string');
        })
        .catch(err => {
          throw err;
        });
    });

    it('should reject users with no credentials', function () {

      return chai.request(app)
        .post('/login')
        .then((res) => {
          expect(res).to.have.status(404);
        })
        .catch(err => {
          throw err;
          // const res = err.response;
          // expect(res).to.have.status(400);
        });
    });

    it('should reject users with incorrect username', function () {
      return chai.request(app)
        .post('/login')
        .send({username: 'wrongUserName', pass})
        .then(res => {
          expect(res).to.have.status(404);
        })
        .catch(err => {
          throw err;
        });
    });

    it('should reject users with incorrect password', function () {
      return chai.request(app)
        .post('/login')
        .send({username, pass: 'thisPasswordIsWrong'})
        .then(res => {
          // console.log(res);
          expect(res).to.have.status(401);
        })
        .catch(err => {
          throw err;
        });
    });

    it('Should return a valid auth token', function () {
      return chai
        .request(app)
        .post('/login')
        .send({username, pass})
        .then(res => {
          // console.log(res);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          });
          // console.log(payload);
          expect(payload.user).to.have.keys(['username', 'name', 'bills', 'id']);
        })
        .catch(err => {
          throw err;
        });
    });

  });

  describe('User page (Protected)', () => {

    const randomUser = generateRandomUser();
    const {username, pass, name} = randomUser;
    const hashedPassword = User.hashPassword(pass);

    beforeEach(function () {
      return User.create({username, pass: hashedPassword, name, bills: generateBills(1)});
    });

    afterEach(function() {
      return User.remove({});
    });
    
    // no gloval vars
      // go through every step that a user would need to do
      // ie - create a user, grab the token, etc to test auth endpoints

    it('should be able to get user bills', function () {
      return chai.request(app)
        .post('/login')
        .send({username, pass})
        .then(res => {
          const token = res.body.authToken;
          return chai.request(app)
            .get('/user')
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
              expect(res).to.have.status(200);
              expect(res.body).to.have.keys(['id', 'username', 'name', 'bills']);
            })
            .catch(err => {
              throw err;
            });
        })
        .catch(err => {
          throw err;
        });
       
    });

    // it('should be able to add a bill', function () {
    //   const newBill = generateBills(1);
    //   return chai.request(app)
    //     .post(`/user/${user._id}/bills`)
    //     .set('Authorization', `Bearer ${token}`)
    //     .set('content-type', 'application/json')
    //     .send(newBill)
    //     .then(res => {
    //       // console.log(res);
    //       // expect(res.body).to.have.keys(['_id', 'username', 'name', 'bills']);
    //       // expect(res.body.bills).should.include.something.that.deep.equals(newBill);
    //     })
    //     .catch(err => {
    //       throw err;
    //     });
    // });

    // it('should be able to delete a bill', function () {

    // });

    // it('should be able to edit a bill', function () {

    // });
  });

  describe('Logout page', () => {
    
  });
  
  

});

// am I misunderstanding Promise rejections? does returning a 'res' object not terminate the chain?
  // 