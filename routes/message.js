const router = require('express').Router();
const verify = require('./verifyToken');
const Conversation = require('../model/Conversation');
const Message = require('../model/Message');
const User = require('../model/User');
const jwt = require('jsonwebtoken');

router.get('/:conversationId', verify, async (req,res) => {
    const token = jwt.decode(req.header('auth-token'));
    const conversationId = req.params.conversationId;

    const messages = await Message.find({conversationId: conversationId});
    
    if(messages.length == 0) return res.json({status: 'failed', message: 'No messages'});

    const identifyCurrentUser = async (messages) => {
        const getMessages = await messages;

        if(getMessages) {
            const newMessages = [];

            for(let i = 0; i < getMessages.length; i++) {
                const sender = getMessages[i].sender[0].id;

                if(sender == token._id) {
                    const newMessage = {
                        _id: getMessages[i]._id,
                        conversationId: getMessages[i].conversationId,
                        isCurrentUser: true,
                        sender: getMessages[i].sender,
                        receiver: getMessages[i].receiver,
                        content: getMessages[i].content,
                        date: getMessages[i].date
                    }

                    newMessages.push(newMessage);
                } else {
                    const newMessage = {
                        _id: getMessages[i]._id,
                        conversationId: getMessages[i].conversationId,
                        isCurrentUser: false,
                        sender: getMessages[i].sender,
                        receiver: getMessages[i].receiver,
                        content: getMessages[i].content,
                        date: getMessages[i].date
                    }
                    newMessages.push(newMessage);
                }
            }

            return newMessages;
        }
    }

    const newMessages = await identifyCurrentUser(messages);

    res.json({status: 'success', messages: newMessages});
});

router.post('/send', verify, async (req, res) => {
    const token = jwt.decode(req.header('auth-token'));
    const data = req.body;
    const receiver = data.participants.filter(participants => participants.id != token._id);
    const sender = await User.findById(token._id);

    const newMessage = new Message({
        conversationId: data.conversationId,
        sender: {name: sender.name, id: sender._id},
        receiver: receiver,
        content: data.message
    })

    try {
        await newMessage.save();
        await Conversation.updateOne({_id: data.conversationId}, {$set:{updatedAt: new Date()}});
        res.json({status: 'success', message: 'Message sent'});
    }
    catch(err) {
        res.json({status: 'failed', message: 'Message not sent'});
    }
})

module.exports = router;