const express = require('express')
const router = express.Router()
const logger = require('tracer').colorConsole();
const userArray = [{
    email: "henk.jan@mail.nl",
    firstName: "Henk",
    lastName: "Jan",
    address: "Lovensdijkstraat 63, Breda",
    password: "rAnDoMww",
    userId: "001"
}, {
    email: "man.vrouw@mail.nl",
    firstName: "Man",
    lastName: "Vrouw",
    address: "RandomWeg 69, Amstelveen",
    password: "NogRaarderWacht",
    userId: "002"
}]

router.get('/', (req, res) => {
    const field1 = req.query.field1;
    const field2 = req.query.field2;
    logger.debug(`Field 1: ${field1}, Field 2: ${field2}`)
    res.status(200).json({
        status: "200",
        message: "All Users-endpoint",
        data: userArray
    });
    //Return list users
})

router.get('/profile', (req, res) =>
    res.status(200).json({
        status: "200",
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
                    status: "200",
                    message: `Userdata-endpoint, user info for ${req.params.userId}`,
                    data: user
                });
                return;
            }
        })
        if (!res.headersSent) {
            res.status(404).json({
                status: "404",
                message: `Userdata-endpoint, user ${req.params.userId} not found`,
                data: {}
            });
        }
    })
    .put((req, res) => {
        res.status(200).json({
            status: "200",
            message: "Put User-endpoint",
            data: {
                email: "henk.jan@mail.nl",
                firstName: "Henk",
                lastName: "Jan",
                address: "Lovensdijkstraat 63, Breda",
                password: "rAnDoMww",
                userId: 001
            }
        });
    })
    .delete((req, res) => {
        res.status(200).json({
            status: "200",
            message: `Delete User-endpoint, User met ID #${req.params.userId} is verwijderd`,
            data: {}
        });
    })



module.exports = router;
