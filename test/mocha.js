'use strict';

var mocha = require('../lib/mocha'),
    path = require('path'),
    fs = require('fs'),
    chai = require('chai'),
    should = chai.should();

describe('Unit Tests', function () {

  it('should pass a sanity chack', function (done) {
    mocha({
      files: [path.join(__dirname, '/fixture/pass.js')],
      quiet: true
    }, function (error, output) {
      should.not.exist(error);
      output.should.include('1 passing');
      done();
    });
  });

  it('should test when mocha passes', function (done) {
    mocha({
      files: [path.join(__dirname, '/fixture/pass.js')],
      quiet: true
    }, function (error) {
      should.not.exist(error);
      done();
    });
  });

  it('should test when mocha fails', function (done) {
    mocha({
      files: [path.join(__dirname, '/fixture/fail.js')],
      quiet: true
    }, function (error) {
      should.exist(error);
      done();
    });
  });

  it('should test setting string options', function (done) {
    mocha({
      files: [path.join(__dirname, '/fixture/pass.js')],
      quiet: true,
      reporter: 'json'
    }, function (error, output) {
      should.not.exist(error);
      (function () {
        JSON.parse(output);
      }).should.not.throw();
      done();
    });
  });

  it('should test setting boolean options', function (done) {

    mocha({
      files: [path.join(__dirname, '/fixture/fail.js')],
      quiet: true,
      reporter: 'json',
      bail: true
    }, function (error, output) {
      should.exist(error);
      output = JSON.parse(output);
      output.stats.tests.should.equal(1);
      done();
    });
  });

  it('should test setting array options', function (done) {

    mocha({
      files: [path.join(__dirname, '/fixture/coffeescript.coffee')],
      quiet: true,
      reporter: 'json',
      compilers: ['coffee:coffee-script/register']
    }, function (error) {
      should.not.exist(error);
      done();
    });
  });

  it('should test requiring modules', function (done) {

    mocha({
      files: [path.join(__dirname, '/fixture/require.js')],
      quiet: true,
      reporter: 'json',
      require: ['should']
    }, function (error, output) {
      should.not.exist(error);
      output = JSON.parse(output);
      output.stats.passes.should.equal(1);
      done();
    });
  });

  it('should test file globbing', function (done) {

    mocha({
      files: [path.join(__dirname, '/fixture/pass*.js')],
      quiet: true,
      reporter: 'json'
    }, function (error, output) {
      should.not.exist(error);
      output = JSON.parse(output);
      output.stats.suites.should.equal(2);
      done();
    });
  });

  it('should test coverage', function (done) {

    mocha({
      files: [path.join(__dirname, '/fixture/pass.js')],
      quiet: true,
      reporter: 'json-cov',
      coverage: true
    }, function (error, output) {
      should.not.exist(error);
      output.should.include('"coverage": 100');
      done();
    });
  });

  it('should test coverage output', function (done) {

    mocha({
      files: [path.join(__dirname, '/fixture/pass.js')],
      quiet: true,
      reporter: 'json-cov',
      output: 'test/out.json'
    }, function (error) {
      should.not.exist(error);
      var filename = path.resolve('test/out.json');
      var jsonOutput = JSON.parse(fs.readFileSync(filename));
      fs.unlinkSync(filename);
      jsonOutput.coverage.should.equals(100);
      done();
    });
  });

  it('should test coverage output when directory does not exist', function (done) {

    mocha({
      files: [path.join(__dirname, '/fixture/pass.js')],
      quiet: true,
      reporter: 'json-cov',
      output: 'test/new/out.json'
    }, function (error) {
      should.not.exist(error);
      var filename = path.resolve('test/new/out.json'),
          dir = path.dirname(filename);
      var jsonOutput = JSON.parse(fs.readFileSync(filename));
      fs.unlinkSync(filename);
      fs.rmdirSync(dir);
      jsonOutput.coverage.should.equals(100);
      done();
    });
  });

  it('should test coveralls integration', function (done) {
    mocha({
      files: [path.join(__dirname, '/fixture/pass.js')],
      coveralls: {
        repoToken: 'bad-token',
        serviceName: 'bad-name',
        serviceJobId: 'bad-job-id'
      }
    }, function (error) {
      // expect a bad response as we intentionaly give coveralls a bad token
      should.exist(error);
      done();
    });
  });

  it('should accept a boolean for coveralls option', function () {
    var opts = mocha.getBaseOptions({
      coveralls: true
    });

    opts.coveralls.should.be.a('object');
  });

  it('should accept a string for require and make it an array', function () {
    var opts = mocha.getBaseOptions({
      require: 'module'
    });

    opts.require.should.eql([
      'module'
    ]);
  });

  // since travis provides the Token, this is tough to test...
  //
  // it('should require that either a supported ci is in use, a repoToken is specified, or a serviceJobId and serviceName are specified', function (done) {
  //   var origTravisVal = process.env.TRAVIS;
  //   delete process.env.TRAVIS;
  //   mocha({
  //     files: [path.join(__dirname, '/fixture/pass.js')],
  //     coveralls: {
  //       repoToken: null,
  //       serviceName: null,
  //       serviceJobId: null
  //     }
  //   }, function (err) {
  //     process.env.TRAVIS = origTravisVal;
  //     err.message.should.match(/(.*(repoToken|serviceName|serviceJobId).*){3}/);
  //     done();
  //   });
  // });

});
