var {
    expect
} = require('chai');
var { compile } = require('./helper');
var expectations = require('./expectations');

describe("BundleRestrictTest", function() {
    describe('green', function () {
        it('should compile successfully', function(done) {
            compile({}, 'green', (err, info, plugin) => {
                if (err) { done(err); }
                expect(info).to.contain("Entrypoint test = test.js");
                expect(plugin.getOutput()).to.equal(expectations.greenNoModule);
                done();
            });
        });

        it('should confirm absence of specified module', function (done) {
            compile({ modules: ['http'] }, "green", (err, info, plugin) => {
                if (err) { done(err); }
                expect(info).to.contain("Entrypoint test = test.js");
                expect(plugin.getOutput()).to.equal(expectations.greenHttpModule);
                done();
            });
        });

        it('should confirm absence of all specified modules', function (done) {
            compile({ modules: ['http', 'fs', 'crypto'] }, "green", (err, info, plugin) => {
                if (err) { done(err); }
                expect(info).to.contain("Entrypoint test = test.js");
                expect(plugin.getOutput()).to.equal(expectations.greenHttpFsCryptoModule);
                done();
            });
        });
    })

    describe('red', function () {
        it('should compile successfully', function (done) {
            compile({}, 'red', (err, info, plugin) => {
                if (err) { done(err); }
                expect(info).to.contain("Entrypoint test = test.js");
                expect(plugin.getOutput()).to.equal(expectations.redNoModule);
                done();
            });
        });

        it('should confirm absence of specified module', function (done) {
            compile({ modules: ['http'] }, "red", (err, info, plugin) => {
              if (err) { done(err); }
              expect(info).to.contain("Entrypoint test = test.js");
              expect(plugin.getOutput()).to.equal(expectations.redHttpModule);
              done();
            });
        });

        it('should error if specified module is present', function (done) {
            compile({ modules: ['lodash'] }, "red", (err, info, plugin) => {
                expect(err.toString()).to.equal(expectations.redLodashModuleErr);
                expect(plugin.getOutput()).to.equal(expectations.redLodashModuleOutput);
                done();
            });
        });

        it('should show all import traces if specified module is present multiple times', function (done) {
            compile({ modules: ['lodash'] }, "red2", (err, info, plugin) => {
                expect(err.toString()).to.equal(expectations.redLodashModuleErr);
                expect(plugin.getOutput()).to.equal(expectations.red2LodashModuleOutput);
                done();
            });
        });
    });

    describe('yellow', function () {
        it('should compile successfully', function (done) {
            compile({}, 'yellow', (err, info, plugin) => {
                if (err) { done(err); }
                expect(info).to.contain("Entrypoint test = test.js");
                expect(plugin.getOutput()).to.equal(expectations.yellowNoModule);
                done();
            });
        });
        it('should still compile successfully if specified module loaded asynchronously', function (done) {
            compile({ modules: ['lodash'] }, "yellow", (err, info, plugin) => {
                if (err) { done(err); }
                expect(info).to.contain("Entrypoint test = test.js");
                expect(plugin.getOutput()).to.equal(expectations.yellowLodashModule);
                done();
            });
        });
    });
});
