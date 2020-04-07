var assert = require('assert');
describe('Array', function () {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});


describe('User', function () {
    describe('#add_user()', function () {
        it('should add a new user', function (done) {
            var user = new User('Luna');
            user.save(function (err) {
                if (err) done(err);
                else done();
            });
        });
    });
});