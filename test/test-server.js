'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;
chai.use(chaiHttp);

function seedUserData () {
  console.info('seeding user data');
  const seedData = [];

  // generate random number for # of bills
  
  // if recurring === true, set up intervals

  for (let i = 0; i < 10; i++) {
    seedData.push({
      username: faker.internet.userName(),
      pass: faker.internet.password(),
      name: faker.name.firstName(),
      bills: [
        {
          from: [faker.name.firstName()],
          for: [faker.name.firstName()],
          recurring: faker.random.boolean(),
          interval: {
            
          },
          title: faker.lorem.words(),
          amount: faker.random.number()
        }
      ]
    });
  }
  return BlogPost.insertMany(seedData); // change
}

function tearDownDB () {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('make sure html is loading for all routes', function () {

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