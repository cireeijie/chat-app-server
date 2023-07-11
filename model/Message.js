const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
        min: 5,
        max: 255
    },
    sender: {
        type: Array,
        required: true,
    },
    receiver: {
        type: Array,
        required: true,
    },
    content: {
        type: String,
        required: true,
        max: 1024
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);