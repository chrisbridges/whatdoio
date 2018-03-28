'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const {User} = require('../models');
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
    const result = {daily: null, weekly: null, monthly: null, yearly: null};
    const intervals = Object.keys(result);
    const randomIntervalIndex = randomNumberWithinRange(0, intervals.length);
    const randomInterval = intervals[randomIntervalIndex];

    if (randomInterval === 'daily') {
      result.daily = true;
    }
    if (randomInterval === 'weekly') {
      result.weekly = {
        dueDay: faker.date.weekday()
      };
    }
    if (randomInterval ==='monthly') {
      result.monthly = {
        dueDate: randomNumberWithinRange(1, 31)
      };
    }
    if (randomInterval === 'yearly') {
      result.yearly = {
        monthDue = faker.date.month(),
        dueDate: randomNumberWithinRange(1, 31)
      };
    }
    return result;
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
          amount: faker.random.number()
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

function tearDownDB () {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Testing API', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedPostData();
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

});