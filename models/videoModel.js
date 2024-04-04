const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
    name: {
        type: String,
        unique:true,
        required: true
    },
   
    video: {
        type: String,
        required: true
    }
}, { timestamps: true });

const videoModel = mongoose.model('videos', videoSchema);
module.exports = videoModel;