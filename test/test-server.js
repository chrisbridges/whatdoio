'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {User} = require('../src/models');
const {TEST_DATABASE_URL} = require('../config');
const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;
chai.use(chaiHttp);

function seedUserData () {
  console.info('seeding user data');
  const seedData = [];

  // generate random number for # of bills
  function randomNumberWithinRange (min, max) {
    return Math.random() * (max - min) + min;
  }

  function generateBillInterval () {
    const intervals = ['1d', '7d', '1m', '1y'];
    const randomIntervalIndex = randomNumberWithinRange(0, intervals.length);
    const randomInterval = intervals[randomIntervalIndex];
    return randomInterval;    
  }

  function generateBills () { 
    const bills = [];
    const randomNum = randomNumberWithinRange(1, 10);
    for (let i = 0; i < randomNum; i++) {
        const bill = {
          from: [faker.name.firstName()],
          for: [faker.name.firstName()],
          recurring: faker.random.boolean(),
          title: faker.lorem.words(),
          amount: faker.random.number(),
          dueDate: new Date(faker.date.recent())
        };
        if (bill.recurring === true) {
          bill.interval = generateBillInterval();
        }
        bills.push(bill);
    }
    return bills;
  }
  // if recurring === true, set up intervals
  const randomNumberOfUsers = randomNumberWithinRange(1,10);
  for (let i = 0; i < randomNumberOfUsers; i++) {
    seedData.push({
      username: faker.internet.userName(),
      pass: faker.internet.password(),
      name: faker.name.firstName(),
      bills: generateBills()
    });
  }

  return User.insertMany(seedData);
}

function generateRandomUser () {
  return {
    username: faker.internet.userName(),
    pass: faker.internet.password(),
    name: faker.name.firstName()
  }
}

function tearDownDB () {
  console.warn('Deleting database');
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
      });
    });

    it('should serve signup page', function() {
      return chai
      .request(app)
      .get('/signup')
      .then(res => {
        expect(res).to.have.status(200);
      });
    });

    it('should serve login page', function() {
      return chai
      .request(app)
      .get('/login')
      .then(res => {
        expect(res).to.have.status(200);
      });
    });

    it('should serve user page', function() {
      return chai
      .request(app)
      .get('/user')
      .then(res => {
        expect(res).to.have.status(200);
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
        });

    });
  });

  describe('Login page', function () {

    const username = faker.internet.userName();
    const pass = faker.internet.password();
    const name = faker.name.firstName();

    beforeEach(function() {
      return User.create({
          username,
          pass,
          name
        })
    });
  
    afterEach(function () {
      return User.remove({});
    });

    it('should reject users with no credentials', function () {

      return chai.request(app)
        .post('/login')
        .then((res) => {
          expect(res).to.have.status(404);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(400);
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
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(400);
        });
    });

    it('should reject users with incorrect password', function () {

      return chai.request(app)
        .post('/login')
        .send({username, pass: 'wrongPass'})
        .then(res => {
          expect(res).to.have.status(401);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(400);
        });
    });

  });

});