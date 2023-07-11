const mongoose = require('mongoose');

const onlineUsersSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        min: 5,
        max: 255
    },
    loggedInDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('OnlineUsers', onlineUsersSchema);