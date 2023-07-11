const router = require('express').Router();
const verify = require('./verifyToken');
const jwt = require('jsonwebtoken');
const Conversation = require('../model/Conversation');
const User = require('../model/User');

router.post('/', verify, async (req,res) => {
    const token = jwt.decode(req.header('auth-token'));
    const participantsId = req.body.participants;
    const currentUser = await User.findById(token._id);

    if(participantsId.length == 0) return res.json({status:'failed', message: `User doesn't exists`})
    
    const getUser = async (userId) => {
        const user = await User.findById(userId);
        let addParticipant = {
            name: user.name,
            id: user._id
        };
        return addParticipant;
    };

    const getParticipants = async () => {
        const participants = [];
        for (let i = 0; i < participantsId.length; i++) {
            const participant = await getUser(participantsId[i]);
            participants.push(participant);
        }
        return participants;
    };

    const setConversationName = (contacts) => {
        const contactName = [];

        for(let i = 0; i < contacts.length; i++) {
            if(contacts[i].id != token._id) {
                contactName.push(contacts[i].name);
            } 

        }

        if(contactName.length == 1) {
            return contactName.join('');
        }

        if(contactName.length > 1) {
            return contactName.join(', ');
        }
    }

    participantsId.push(token._id);

    const updateUsersContact = async (users, newContact) => {
        const participants = await users;
        const participantsName = [];
        
        for(let i = 0; i < participants.length; i++) {
            participantsName.push(participants[i].name);
        }

        if(participants.length == 0) return 'No contact found';

        for(let i = 0; i < participants.length; i++) {
            const user = await User.findById(participants[i].id);
            const contactName = participantsName.filter(name => name != user.name);

            if(contactName.length == 1) {
                newContact.contactName = contactName.join('');
            } else {
                newContact.contactName = contactName.join(', ');
            }

            await User.updateOne({email: user.email}, {$push : {contacts: newContact}});
        }
    }

    const finalParticipants = await getParticipants();
    const countContact = finalParticipants.filter(participant => participant.id != token._id);
    const verifyConversation = await Conversation.find({participants: finalParticipants});
    
    if(verifyConversation.length == 0) {
        const conversation = new Conversation ({
            participants: finalParticipants,
            type: countContact.length == 1 ? 'one-on-one' : 'group'
        })

        const newContact = {
            contactName: '',
            participants: finalParticipants,
            type: countContact.length == 1 ? 'one-on-one' : 'group',
            conversationId: conversation._id.toString()
        }
    
        try{
            await conversation.save();
            await updateUsersContact(finalParticipants, newContact);
            res.json({status: 'success', message: 'Contact added'})
        } catch(err) {
            console.log(err);
        }
    }
    else {
        res.json({status: 'failed', message: 'Conversation existed'})
    }
});

router.get('/', verify, async (req, res) => {
    const token = jwt.decode(req.header('auth-token'));
    const currentUser = await User.findById(token._id);
    const userContacts = currentUser ? currentUser.contacts : [];

    if(userContacts.length != 0) {
        
        res.json({status: 'success', contacts: userContacts});
    }
    else {
        res.json({status: 'failed', message: 'No conversations'});
    }
});

module.exports = router;