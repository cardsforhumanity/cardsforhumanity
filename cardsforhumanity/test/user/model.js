/**
 * Module dependencies.
 */
var should = require('should'),
    app = require('../../server'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

//Globals
var user;

var crypto;
try {
    crypto = require('crypto');
} catch (err) {
    console.log('crypto support is disabled!');
}
function getRandomString(length){
    if(crypto) {
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0, length);   /** return required number of characters */
    }
    else {
        return Date.now.toString();
    }
}

//The tests
describe('<Unit Test>', function() {
    describe('Model User:', function() {
        before(function(done) {
            user = new User({
                name: 'Full name',
                email: 'test@test.com',
                username: getRandomString(12),
                password: 'password'
            });
            
            done();
        });

        describe('Method Save', function() {
            it('should be able to save without problems', function(done) {
                return user.save(function(err) {
                    should.not.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save without name', function(done) {
                user.name = '';
                return user.save(function(err) {
                    should.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save with already-existing username', function(done) {
                var copy = new User({
                    name: 'Copy user',
                    email: 'copy@copy.com',
                    username: user.username,
                    password: 'password'
                });
                return copy.save(function(err) {
                    should.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save without username', function(done) {
                user.name = 'Full name';
                user.username = '';
                return user.save(function(err) {
                    should.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save with email not properly formed', function(done) {
                user.email = 'wrong-format';
                return user.save(function(err) {
                    should.exist(err);
                    done();
                });
            });
        });

        after(function(done) {
            done();
        });
    });
});