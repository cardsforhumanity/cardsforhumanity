/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  User = mongoose.model('User');
var avatars = require('./avatars').all();

/**
 * Auth callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/chooseavatars');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
  if (!req.user) {
    res.render('users/signin', {
      title: 'Signin',
      message: req.flash('error')
    });
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Show sign up form
 */
exports.signup = function(req, res) {
  if (!req.user) {
    res.render('users/signup', {
      title: 'Sign up',
      user: new User()
    });
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Logout
 */
exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
  res.redirect('/');
};

/** 
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 */
exports.checkAvatar = function(req, res) {
  console.log('checkAvatar: req.user',req.user);
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
    })
    .exec(function(err, user) {
      if (user.avatar !== undefined) {
        console.log('user has an avatar; redirecting to game');
        res.redirect('/#!/app');
      } else {
        console.log('user does not have an avatar; redirecting to avatar picker');
        res.render('users/choose-avatar', {
          title: 'Choose an Avatar!'
        });
      }
    });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }

};

/**
 * Create user
 */
exports.create = function(req, res) {
  // TODO: This should check to see if the username/email already has an account
  var user = new User(req.body);
  // Switch the user's avatar index to an actual avatar url
  user.avatar = avatars[user.avatar];
  user.provider = 'local';
  user.save(function(err) {
    if (err) {
      return res.render('users/signup', {
        errors: err.errors,
        user: user
      });
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/#!/app');
    });
  });
};

/**
 * Assign avatar to user
 */
exports.avatars = function(req, res) {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) && avatars[req.body.avatar]) {
    User.findOne({
      _id: req.user._id
    })
    .exec(function(err, user) {
      user.avatar = avatars[req.body.avatar];
      user.save();
    });
  }
  return res.redirect('/#!/app');
};

/**
 *  Show profile
 */
exports.show = function(req, res) {
  var user = req.profile;

  res.render('users/show', {
    title: user.name,
    user: user
  });
};

/**
 * Send User
 */
exports.me = function(req, res) {
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
  User
    .findOne({
      _id: id
    })
    .exec(function(err, user) {
      if (err) return next(err);
      if (!user) return next(new Error('Failed to load User ' + id));
      req.profile = user;
      next();
    });
};