const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: {
        type: Array,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Conversation', conversationSchema);