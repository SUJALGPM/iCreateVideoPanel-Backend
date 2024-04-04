const mongoose = require('mongoose');

const videoUserUsage = new mongoose.Schema({
    
});


const cardCategorySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['videocard']
    },
    doctorName: String,
    videoname: String,
    fileName: String,
    dateOfCreation: {
        type: Date,
        default: Date.now
    },
    timeOfCreation: {
        type: String,
        default: () => {
            const currentTime = new Date();
            const hours = currentTime.getHours().toString().padStart(2, '0');
            const minutes = currentTime.getMinutes().toString().padStart(2, '0');
            const seconds = currentTime.getSeconds().toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }
    },
    processTime: String,
    cardCategories: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const userSchema = new mongoose.Schema({
    USERNAME: {
        type: String,
        // required: true,

    },
    MRID: {
        type: String,
        // required: true,
        unique: true
    },
    PASSWORD: {
        type: String,
        // required: true,
    },
    EMAIL: {
        type: String,
        //  required: true,
        // unique: true,
    },
    ROLE: {
        type: String,
        // required: true,
    },
    HQ: {
        type: String,
        // required : true,
    },
    REGION: {
        type: String,
        // required:true,
    },
    BUSINESSUNIT: {
        type: String,
        // required:true

    },
    DOJ: {
        type: String,
        // required:true
    },


    loginLogs: [
        {
            timestamp: {
                type: Date,
                default: Date.now,
            },
            cnt: {
                type: Number,
                required: false,
                default: 0
            },
        },
    ],
    cardCategories: [cardCategorySchema],
});

const User = mongoose.model('User', userSchema);
const UsageModel = mongoose.model('UsageData', cardCategorySchema);




module.exports = { User, UsageModel };
