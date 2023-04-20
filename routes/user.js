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
}]

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
    //TODO: Implement token usage (authorization), right now valid token=1 or 2
    if (req.query.token == undefined) {
        res.status(401).json({
            status: 401,
            message: `Profile-endpoint: Unauthorized, token is undefined`,
            data: {}
        })
    } else {
        switch (req.query.token.trim()) {
            case "1":
                logger.info(`User with token ${req.query.token} called profile info`)
                res.status(200).json({
                    status: 200,
                    message: "Profile-endpoint",
                    data: userArray[0]
                })
                break;
            case "2":
                logger.info(`User with token ${req.query.token} called profile info`)
                res.status(200).json({
                    status: 200,
                    message: "Profile-endpoint",
                    data: userArray[1]
                })
                break;
            default:
                logger.error(`Token ${req.query.token} is invalid`)
                res.status(401).json({
                    status: 401,
                    message: `Profile-endpoint: Unauthorized, Invalid token ${req.query.token}`,
                    data: {}
                })
                break;
        }
    }
}
);

router.route('/:userId')
    .get((req, res) => {
        //TODO: implement check for ownership through authorization
        //TODO: check token
        logger.debug(`Getting userdata for: ${req.params.userId}`)
        userArray.forEach(user => {
            if (user.id == req.params.userId) {
                let returnuser = (({ password, ...o }) => o)(user)
                if (req.query.owner == "true") {
                    returnuser = user;
                }
                res.status(200).json({
                    status: 200,
                    message: `Userdata-endpoint: User info for ${req.params.userId}`,
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
    })
    .put((req, res) => {
        //TODO: Check ownership through token 403
        //TODO: Move usercheck to params.userId
        const emailAddress = req.query.emailAddress;
        if (emailAddress == undefined) {
            logger.error(`EmailAddress is not provided for updating user`)
            res.status(400).json({
                status: 400,
                message: `Userdata Update-endpoint: Bad Request, email is not provided`,
                data: {}
            });
        } else {
            let user = userArray.find(user => user.emailAddress == emailAddress);
            if (user == undefined) {
                res.status(404).json({
                    status: 404,
                    message: `Userdata Update-endpoint: Not Found, User with email ${emailAddress} not found`,
                    data: {}
                });
            } else {
                for (const [key, value] of Object.entries((({ emailAddress, ...o }) => o)(req.query))) {
                    if (user[key] != undefined) {
                        logger.debug(`Changing ${key} for ${emailAddress} from ${user[key]} to ${value}`)
                        if (!user.password.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)) {
                            //Checks if password matches at least 1 number, at least 1 special character and is between 6 and 16 characters
                            logger.error(`Invalid password: ${user.password}`)
                            res.status(400).json({
                                status: 400,
                                message: "Userdata Update-endpoint: Bad Request, password is not valid (1 number, 1 special character, 6-16 characters)",
                                data: {}
                            });
                        } else if (!user.phoneNumber.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)) {
                            logger.error(`Invalid phoneNumber: ${user.phoneNumber}`)
                            res.status(400).json({
                                status: 400,
                                message: "Userdata Update-endpoint: Bad Request, phone number is not valid",
                                data: {}
                            });
                        } else {
                            user[key] = value;
                        }
                    } else {
                        logger.warn(`Key ${key} is not applicable to User`)
                    }
                }
                res.status(200).json({
                    status: 200,
                    message: `Userdata Update-endpoint: User with email ${emailAddress} was succesfully updated`,
                    data: user
                });
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
