'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const {app} = require('../server');

const expect = chai.expect;
chai.use(chaiHttp);

describe('make sure root serves static html', function () {
  it('should serve home page', function () {
    return chai
    .request(app)
    .get('/')
    .then(res => {
      expect(res).to.have.status(200);
    });
  });
});