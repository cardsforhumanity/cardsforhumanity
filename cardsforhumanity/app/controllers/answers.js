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
 * Show an answer
 */
exports.show = function(req, res) {
    res.jsonp(req.answer);
};

/**
 * List of Answers
 */
exports.all = function(req, res) {
    Answer.find({official:true}).select('-_id').exec(function(err, answers) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(answers);
        }
    });
};

/**
 * List of Answers (for Game class)
 */
exports.allAnswersForGame = function(cb) {
    Answer.find({official:true}).select('-_id').exec(function(err, answers) {
        if (err) {
            console.log(err);
        } else {
            cb(answers);
        }
    });
};