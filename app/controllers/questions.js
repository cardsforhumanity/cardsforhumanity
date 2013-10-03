/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Question = mongoose.model('Question'),
    _ = require('underscore');


/**
 * Find question by id
 */
exports.question = function(req, res, next, id) {
    Question.load(id, function(err, question) {
        if (err) return next(err);
        if (!question) return next(new Error('Failed to load question ' + id));
        req.question = question;
        next();
    });
};

/**
 * Create a question
 */
exports.create = function(req, res) {
    var question = new Question(req.body);
    question.user = req.user;

    question.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                question: question
            });
        } else {
            res.jsonp(question);
        }
    });
};

/**
 * Update a question
 */
exports.update = function(req, res) {
    var question = req.question;

    question = _.extend(question, req.body);

    question.save(function(err) {
        res.jsonp(question);
    });
};

/**
 * Delete an question
 */
exports.destroy = function(req, res) {
    var question = req.question;

    question.remove(function(err) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(question);
        }
    });
};

/**
 * Show an question
 */
exports.show = function(req, res) {
    res.jsonp(req.question);
};

/**
 * List of Questions
 */
exports.all = function(req, res) {
    Question.find().exec(function(err, questions) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(questions);
        }
    });
};