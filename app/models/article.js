/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
    id: {
        type: Number
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    user: {
        type: Object
    }
});

/**
 * Statics
 */
ArticleSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            id: id
        }).select('-_id').exec(cb);
    }
};

mongoose.model('Article', ArticleSchema);