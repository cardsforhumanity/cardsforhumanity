/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Answer = mongoose.model('Answer'),
    _ = require('underscore');


/**
 * Find answer by id
 */
exports.answer = function(req, res, next, id) {
    Answer.load(id, function(err, answer) {
        if (err) return next(err);
        if (!answer) return next(new Error('Failed to load answer ' + id));
        req.answer = answer;
        next();
    });
};

/**
 * Create a answer
 */
exports.create = function(req, res) {
    var answer = new Answer(req.body);
    answer.user = req.user;

    answer.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                answer: answer
            });
        } else {
            res.jsonp(answer);
        }
    });
};

/**
 * Update a answer
 */
exports.update = function(req, res) {
    var answer = req.answer;

    answer = _.extend(answer, req.body);

    answer.save(function(err) {
        res.jsonp(answer);
    });
};

/**
 * Delete an answer
 */
exports.destroy = function(req, res) {
    var answer = req.answer;

    answer.remove(function(err) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(answer);
        }
    });
};

/**
 * Show an answer
 */
exports.show = function(req, res) {
    res.jsonp(req.answer);
};

/**
 * List of Answers
 */
exports.all = function(req, res) {
    Answer.find().exec(function(err, answers) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(answers);
        }
    });
};