const express = require('express')
const router = express.Router()
const logger = require('tracer').colorConsole();
const userArray = [{
    id: 1,
    firstName: "Henk",
    lastName: "Jan",
    street: "Lovensdijkstraat",
    city: "Breda",
    isActive: "false",
    emailAddress: "henk.jan@mail.nl",
    password: "rAnDoMww1!",
    phoneNumber: "310612345678"
}, {
    id: 2,
    firstName: "Man",
    lastName: "Vrouw",
    street: "RandomWeg",
    city: "Amstelveen",
    isActive: "true",
    emailAddress: "man.vrouw@mail.nl",
    password: "NogRaarder1!",
    phoneNumber: "310612345678"
}, {
    id: 3,
    firstName: "Henk",
    lastName: "van der Veen",
    street: "Hogeschoollaan",
    city: "Breda",
    isActive: "true",
    emailAddress: "hvdveen@mail.nl",
    password: "hvdVeen1!",
    phoneNumber: "310612345678"
}, {
    id: 4,
    firstName: "Marie",
    lastName: "van der Veen",
    street: "Hogeschoollaan",
    city: "Breda",
    isActive: "false",
    emailAddress: "mvdveen@mail.nl",
    password: "mvdVeen1!",
    phoneNumber: "310612345678"
}, {
    id: 5,
    firstName: "Leo",
    lastName: "Hogerhede",
    street: "Universiteitslaan",
    city: "Tilburg",
    isActive: "true",
    emailAddress: "lhoger@tilburguni.nl",
    password: "Uni1Til!",
    phoneNumber: "310612345678"
}]
const Joi = require('joi');
const tokenSchema = Joi.string().token().required();
const emailSchema = Joi.string().email().required();
const phoneSchema = Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im).required().messages({ 'string.pattern.base': `{:[.]} is not a valid phone number` });

router.get('/', (req, res) => {
    if (Object.keys(req.query).length != 0) {
        logger.debug(`Filtering on: ${Object.entries(req.query)}`)
        let result = [...userArray];
        for (const [key, value] of Object.entries(req.query)) {
            result = result.filter(function (user) {
                return value == user[key]
            })
        }
        res.status(200).json({
            status: 200,
            message: "All Users-endpoint: filtered",
            data: result
        });
    } else {
        res.status(200).json({
            status: 200,
            message: "All Users-endpoint",
            data: userArray
        });
    }
})

router.get('/profile', (req, res) => {
    //TODO: Implement token usage (authorization)
    const result = tokenSchema.validate(req.query.token);
    if (result.error != undefined) {
        logger.error(result.error.message.replace("value", "token"))
        res.status(401).json({
            status: 401,
            message: `Profile-endpoint: Unauthorized, ${result.error.message.replace("value", "token")}`,
            data: {}
        })
    } else {
        if (true) {
            logger.info(`User with token ${req.query.token} called profile info`)
            res.status(200).json({
                status: 200,
                message: "Profile-endpoint: This function is not implemented yet",
                data: {}
            })
        } else {
            //Run on invalid token
            logger.error(`Token ${req.query.token} is invalid`)
            res.status(401).json({
                status: 401,
                message: `Profile-endpoint: Unauthorized, Invalid token ${req.query.token}`,
                data: {}
            })
        }
    }
}
);

router.route('/:userId')
    .get((req, res) => {
        //TODO: check token 401
        const result = tokenSchema.validate(req.query.token);
        if (result.error != undefined) {
            logger.error(result.error.message.replace("value", "token"))
            res.status(401).json({
                status: 401,
                message: `Userdata-endpoint: Unauthorized, ${result.error.message.replace("value", "token")}`,
                data: {}
            })
        } else {
            logger.info(`User with token ${req.query.token} called get userdata for: ${req.params.userId}`)
            userArray.forEach(user => {
                if (user.id == req.params.userId) {
                    let returnuser = (({ password, ...o }) => o)(user)
                    //If query trigger is owner of account => returnuser = user; (for password)
                    res.status(200).json({
                        status: 200,
                        message: `Userdata-endpoint: User info for #${req.params.userId}`,
                        data: returnuser
                    });
                    return;
                }
            })
            if (!res.headersSent) {
                logger.error(`User ${req.params.userId} does not exist`)
                res.status(404).json({
                    status: 404,
                    message: `Userdata-endpoint: Not Found, User with ID #${req.params.userId} not found`,
                    data: {}
                });
            }
        }
    })
    .put((req, res) => {
        //TODO: Check ownership through token 403
        //TODO: Check logged in
        const result = emailSchema.validate(req.query.emailAddress);
        if (result.error != undefined) {
            logger.error(result.error.message.replace("value", "emailAddress"))
            res.status(400).json({
                status: 400,
                message: `Userdata Update-endpoint: Bad Request, ${result.error.message.replace("value", "emailAddress")}`,
                data: {}
            });
        } else {
            if (req.query.phoneNumber != undefined) {
                const result = phoneSchema.validate(req.query.phoneNumber);
                if (result.error != undefined) {
                    logger.error(result.error.message.replace("value", "phoneNumber"))
                    res.status(400).json({
                        status: 400,
                        message: `Userdata Update-endpoint: Bad Request, ${result.error.message.replace("value", "phoneNumber")}`,
                        data: {}
                    });
                }
            }
            if (!res.headersSent) {
                let user = userArray.find(user => user.id == req.params.userId && user.emailAddress == req.query.emailAddress);
                if (user == undefined) {
                    logger.error(`User with id #${req.params.userId} and email ${emailAddress} not found`)
                    res.status(404).json({
                        status: 404,
                        message: `Userdata Update-endpoint: Not Found, User with id #${req.params.userId} and email ${emailAddress} not found`,
                        data: {}
                    });
                } else {
                    if (!res.headersSent) {
                        for (const [key, value] of Object.entries((({ emailAddress, ...o }) => o)(req.query))) {
                            if (user[key] != undefined) {
                                logger.debug(`Changing ${key} for #${req.params.userId} from ${user[key]} to ${value}`)
                                user[key] = value;
                            } else {
                                logger.warn(`Key ${key} is not applicable to User`)
                            }
                        }
                        res.status(200).json({
                            status: 200,
                            message: `Userdata Update-endpoint: User with Id #${req.params.userId} was succesfully updated`,
                            data: user
                        });
                    }
                }
            }
        }
    })
    .delete((req, res) => {
        //TODO: Check logged in
        //TODO: Check ownership through authorization
        userArray.forEach(user => {
            if (user.id == req.params.userId) {
                userArray.splice(userArray.indexOf(user), 1)
                logger.debug(`User with ID #${req.params.userId} succesfully deleted`)
                res.status(200).json({
                    status: 200,
                    message: `Userdata Delete-endpoint: User with ID #${req.params.userId} succesfully deleted`,
                    data: {}
                });
                return;
            }
        })
        if (!res.headersSent) {
            logger.error(`User with ID #${req.params.userId} does not exist`)
            res.status(404).json({
                status: 404,
                message: `Userdata Delete-endpoint: Not Found, User with ID #${req.params.userId} not found`,
                data: {}
            });
        }
    })

module.exports = { router, userArray };
