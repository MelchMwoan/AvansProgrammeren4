const express = require('express')
const router = express.Router()
const logger = require('tracer').colorConsole();
const user = require('./user.js');
//TODO: joi input validation
router.post('/', (req, res) => {
    const firstName = req.query.firstName;
    const lastName = req.query.lastName;
    const street = req.query.street;
    const city = req.query.city;
    const isActive = req.query.isActive;
    const emailAddress = req.query.emailAddress;
    const password = req.query.password;
    const phoneNumber = req.query.phoneNumber;
    logger.debug(`Given data: FirstName: ${firstName}, LastName: ${lastName}, Street: ${street}, City: ${city}, Active: ${isActive},Email: ${emailAddress}, Password: ${password}, Phone: ${phoneNumber}`)
    if (firstName == undefined || lastName == undefined || street == undefined || city == undefined || emailAddress == undefined || password == undefined || phoneNumber == undefined) {
        res.status(400).json({
            status: 400,
            message: "Register-endpoint: Bad Request, please provide all required properties",
            data: {}
        });
    } else {
        if (!emailAddress.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/)) {
            logger.error(`Invalid email: ${emailAddress}`)
            res.status(400).json({
                status: 400,
                message: "Register-endpoint: Bad Request, email is not valid",
                data: {}
            });
        } else if (!password.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)) {
            //Checks if password matches at least 1 number, at least 1 special character and is between 6 and 16 characters
            logger.error(`Invalid password: ${password}`)
            res.status(400).json({
                status: 400,
                message: "Register-endpoint: Bad Request, password is not valid (1 number, 1 special character, 6-16 characters)",
                data: {}
            });
        } else if (!phoneNumber.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)) {
            logger.error(`Invalid phoneNumber: ${phoneNumber}`)
            res.status(400).json({
                status: 400,
                message: "Register-endpoint: Bad Request, phone number is not valid",
                data: {}
            });
        } else {
            user.userArray.forEach(user => {
                if (user.emailAddress == emailAddress) {
                    logger.error(`User with email ${emailAddress} already exists`)
                    res.status(403).json({
                        status: 403,
                        message: `Register-endpoint: Forbidden, user with email: '${emailAddress}' already exists`,
                        data: {}
                    });
                    return;
                }
            })
        }
        if (!res.headersSent) {
            user.userArray.push({
                id: user.userArray.length + 1,
                firstName: firstName,
                lastName: lastName,
                street: street,
                city: city,
                isActive: (isActive == undefined ? "true" : isActive),
                emailAddress: emailAddress,
                password: password,
                phoneNumber: phoneNumber
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
