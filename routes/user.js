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
    password: "rAnDoMww",
    phoneNumber: "06 12345678"
}, {
    id: 2,
    firstName: "Man",
    lastName: "Vrouw",
    street: "RandomWeg",
    city: "Amstelveen",
    isActive: "true",
    emailAddress: "man.vrouw@mail.nl",
    password: "NogRaarderWacht",
    phoneNumber: "06 12345678"
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
        logger.debug(`Getting userdata for: ${req.params.userId}`)
        userArray.forEach(user => {
            if (user.id == req.params.userId) {
                let returnuser = (({ password, ...o }) => o)(user)
                if(req.query.owner == "true") {
                    returnuser = user;
                }
                res.status(200).json({
                    status: 200,
                    message: `Userdata-endpoint, user info for ${req.params.userId}`,
                    data: returnuser
                });
                return;
            }
        })
        if (!res.headersSent) {
            logger.error(`User ${req.params.userId} does not exist`)
            res.status(404).json({
                status: 404,
                message: `Userdata-endpoint, user ${req.params.userId} not found`,
                data: {}
            });
        }
    })
    .put((req, res) => {
        const firstName = req.query.firstName;
        const lastName = req.query.lastName;
        const street = req.query.street;
        const city = req.query.city;
        const isActive = req.query.isActive;
        const emailAddress = req.query.emailAddress;
        const password = req.query.password;
        const phoneNumber = req.query.phoneNumber;
        logger.debug(`Given data: FirstName: ${firstName}, LastName: ${lastName}, Street: ${street}, City: ${city}, Active: ${isActive},Email: ${emailAddress}, Password: ${password}, Phone: ${phoneNumber}`)
        if(emailAddress == undefined) {

        }
        res.status(200).json({
            status: 200,
            message: "Put User-endpoint",
            data: {
                email: "henk.jan@mail.nl",
                firstName: "Henk",
                lastName: "Jan",
                address: "Lovensdijkstraat 63, Breda",
                password: "rAnDoMww",
                userId: 1
            }
        });
    })
    .delete((req, res) => {
        res.status(200).json({
            status: 200,
            message: `Delete User-endpoint, User met ID #${req.params.userId} is verwijderd`,
            data: {}
        });
    })

module.exports = { router, userArray };
