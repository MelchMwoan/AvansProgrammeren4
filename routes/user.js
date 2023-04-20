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
        for(const [key, value] of Object.entries(req.query)) {
            result = result.filter(function (user) {
                return value==user[key]
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

router.get('/profile', (req, res) =>
    res.status(200).json({
        status: 200,
        message: "Profile-endpoint",
        data: {
            email: "henk.jan@mail.nl",
            firstName: "Henk",
            lastName: "Jan",
            address: "Lovensdijkstraat 63, Breda",
            password: "rAnDoMww",
            userId: "001"
        }
    })
);

router.route('/:userId')
    .get((req, res) => {
        logger.log(`Getting userdata for ${req.params.userId}`)
        userArray.forEach(user => {
            if (user.userId == req.params.userId) {
                res.status(200).json({
                    status: 200,
                    message: `Userdata-endpoint, user info for ${req.params.userId}`,
                    data: user
                });
                return;
            }
        })
        if (!res.headersSent) {
            res.status(404).json({
                status: 404,
                message: `Userdata-endpoint, user ${req.params.userId} not found`,
                data: {}
            });
        }
    })
    .put((req, res) => {
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
