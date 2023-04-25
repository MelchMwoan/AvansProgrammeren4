const express = require('express')
const router = express.Router()
const logger = require('tracer').colorConsole();
const user = require('./user.js');
const Joi = require('joi');
const schema = Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30).required(),
    street: Joi.string().min(3).max(30).required(),
    city: Joi.string().min(3).max(30).required(),
    isActive: Joi.boolean(),
    emailAddress: Joi.string().email().required(),
    password: Joi.string().pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/).required().messages({ 'string.pattern.base': `{:[.]} is not a valid password (at least 1 number and 1 special character, 6-16 characters)` }),
    phoneNumber: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im).required().messages({ 'string.pattern.base': `{:[.]} is not a valid phone number` })
})

router.post('/', (req, res) => {
    const result = schema.validate(req.query);
    logger.debug("Received data for register: " + JSON.stringify(result.value))
    if (result.error != undefined) {
        logger.error(result.error.message)
        res.status(400).json({
            status: 400,
            message: "Register-endpoint: Bad Request, " + result.error.message,
            data: {}
        });
    } else {
        user.userArray.forEach(user => {
            if (user.emailAddress == req.query.emailAddress) {
                logger.error(`User with email ${req.query.emailAddress} already exists`)
                res.status(403).json({
                    status: 403,
                    message: `Register-endpoint: Forbidden, user with email: '${req.query.emailAddress}' already exists`,
                    data: {}
                });
                return;
            }
        })
        if (!res.headersSent) {
            user.userArray.push({
                id: user.userArray.length + 1,
                firstName: req.query.firstName,
                lastName: req.query.lastName,
                street: req.query.street,
                city: req.query.city,
                isActive: (req.query.isActive == undefined ? "true" : req.query.isActive),
                emailAddress: req.query.emailAddress,
                password: req.query.password,
                phoneNumber: req.query.phoneNumber
            });
            logger.info(`User with id ${user.userArray.length} has been created`)
            res.status(201).json({
                status: 201,
                message: "Register-endpoint: Created, succesfully created a new user",
                data: user.userArray.at(-1)
            });
        }
    }
})

module.exports = router;
