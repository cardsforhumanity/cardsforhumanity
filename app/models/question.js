/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema;


/**
 * Question Schema
 */
var QuestionSchema = new Schema({
    id: {
        type: Number
    },
    text: {
        type: String,
        default: '',
        trim: true
    },
    numAnswers: {
        type: Number
    },
    expansion: {
        type: String,
        default: '',
        trim: true
    }
});

/**
 * Statics
 */
QuestionSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).populate('user', 'name username').exec(cb);
    }
};

mongoose.model('Question', QuestionSchema);