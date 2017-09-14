/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    _ = require('underscore'),
    authTypes = ['github', 'twitter', 'facebook', 'google'];


/**
 * User Schema
 */
var UserSchema = new Schema({
    name: {type: String, required: true},
    email: String,
    username: {type: String, required: true, unique: true, index: true},
    provider: String,
    avatar: String,
    premium: Number, // null or 0 for non-donors, 1 for everyone else (for now)
    donations: [],
    hashed_password: String,
    facebook: {},
    twitter: {},
    github: {},
    google: {}
});
//UserSchema.index({ username: 1 }, { unique: true });

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.hashed_password = this.encryptPassword(password);
}).get(function() {
    return this._password;
});

/**
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
};

// the below 4 validations only apply if you are signing up traditionally
UserSchema.path('name').validate(function(name) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return name.length;
}, 'Name cannot be blank');

UserSchema.path('email').validate(function(email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
}, 'Email cannot be blank');

UserSchema.path('username').validate(function(username) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return username.length;
}, 'Username cannot be blank');

UserSchema.path('hashed_password').validate(function(hashed_password) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashed_password.length;
}, 'Password cannot be blank');

//small, simple check for email syntax
UserSchema.path('email').validate(function (email) {
   //var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
   //var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
   //return emailRegex.test(email.text); // Assuming email has a text attribute

   //TODO: this is a dummy test, and should be replaced with a suitable regex test
   return email.indexOf('@') > -1;
}, 'Email is not properly formed.');


/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1)
        next(new Error('Invalid password'));
    else
        next();
});

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        if (!plainText || !this.hashed_password) {
            return false;
        }
        return bcrypt.compareSync(plainText,this.hashed_password);
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password) return '';
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    }
};

mongoose.model('User', UserSchema);
