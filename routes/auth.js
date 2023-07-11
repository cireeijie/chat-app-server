const router = require('express').Router();
const User = require('../model/User');
const OnlineUsers = require('../model/OnlineUsers');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verify = require('./verifyToken');
const {registerValidation, loginValidation} = require('../validation');

// Registration
router.post('/register', async (req, res) => {
    // Validate passed data before saving
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).json({status: 'failed', key: error.details[0].context.key, message: error.details[0].message});

    // Checking if user exist in the database
    const emailExist = await User.findOne({email: req.body.userEmail});
    if(emailExist) return res.status(400).json({status: 'failed', message:'Email already exists'});

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.userPassword, salt);
    
    const user = new User({
        name: req.body.userName,
        email: req.body.userEmail,
        password: hashedPassword,
        token: ''
    });

    try{
        await user.save();
        res.json({message: 'Registration Successful', status: 'success'});
    } catch(err) {
        res.status(400).json({message: 'Something is wrong with the server', status: 'failed'});
    }
});

// Login
router.post('/login', async (req, res) => {
    // Validate passed data before logging in
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).json({status: 'failed', key: error.details[0].context.key, message: error.details[0].message});

    // Checking if email exist
    const user = await User.findOne({email: req.body.userEmail});
    if(!user) return res.status(400).json({status: 'failed', message: `Email doesn't not exist.`});

    // Check if password is valid
    const validPass = await bcrypt.compare(req.body.userPassword, user.password);
    
    if(!validPass) return res.status(400).json({status: 'failed', message: 'Invalid password'});

    // Create and assign token
    const token = jwt.sign({_id: user._id}, process.env.SECRET_TOKEN, {expiresIn: '1d'});
    const onlineUser = new OnlineUsers({
        userId: user._id
    })
    
    await onlineUser.save();

    res.header('auth-token', token).json({status: 'success', message: 'Login successful!', token: token}); 
});

// Logout
router.post('/logout', verify, async (req, res) => {
    const token = jwt.decode(req.header('auth-token'));
    await OnlineUsers.deleteOne({userId: token._id});
    
    res.header('auth-token', '').send({message: 'You are logged out!', status: 'success'});
})

module.exports = router