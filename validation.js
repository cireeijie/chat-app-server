// Validation
const Joi = require('@hapi/joi');

// Register Validation
const registerValidation = (data) => {
    const schema = Joi.object({
        userName: Joi.string().min(6).required(),
        userEmail: Joi.string().min(6).required().email(),
        userPassword: Joi.string().min(6).required()
    });
    
    return schema.validate(data);
};

// Login Validation
const loginValidation = (data) => {
    const schema = Joi.object({
        userEmail: Joi.string().min(6).required().email(),
        userPassword: Joi.string().min(6).required()
    });
    
    return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;