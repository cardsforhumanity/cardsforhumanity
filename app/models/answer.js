/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema;


/**
 * Answer Schema
 */
var AnswerSchema = new Schema({
    id: {
        type: Number
    },
    text: {
        type: String,
        default: '',
        trim: true
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
AnswerSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).populate('user', 'name username').exec(cb);
    }
};

mongoose.model('Answer', AnswerSchema);