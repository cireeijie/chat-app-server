const router = require('express').Router();
const verify = require('./verifyToken');
const User = require('../model/User');
const jwt = require('jsonwebtoken');

router.post('/', verify, async (req,res) => {
    const token = jwt.decode(req.header('auth-token'));
    const searchResult = await User.find({name: {$regex: `.*${req.body.name}.*`, $options: 'i'}});

    const filterResult = (result) => {
        const newResult = result.filter(user => user._id != token._id);

        return newResult;
    }

    const newResult = await filterResult(searchResult)

    if(searchResult.length == 0) {
        return res.json({status: "failed", message: "No users found"});
    }

    res.json({status: "success", users: newResult});
});

module.exports = router;