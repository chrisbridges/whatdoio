'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const {app} = require('../server');

const expect = chai.expect;
chai.use(chaiHttp);

describe('make sure html is loading for all routes', function () {

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
/*
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
*/
});