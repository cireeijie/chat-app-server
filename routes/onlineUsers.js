const router = require('express').Router();
const verify = require('./verifyToken');
const jwt = require('jsonwebtoken');
const OnlineUsers = require('../model/OnlineUsers');


router.get('/', verify, async(req, res) => {
    const onlineUsers = await OnlineUsers.find().exec();

    if(onlineUsers.length == 0) return res.json({status: 'failed', message: 'No online users'});
    
    res.json({status: 'success', onlineUsers: onlineUsers});
})

module.exports = router;