const express = require('express')
const router = express.Router()
const logger = require('tracer').colorConsole();

router.get('/', (req, res) => {
    const userArray = [{ name: "user1", id: 001 }, { name: "user2", id: 002 }]
    const field1 = req.query.field1;
    const field2 = req.query.field2;
    logger.debug(`Field 1: ${field1}, Field 2: ${field2}`)
    res.json({
        status: "200",
        message: "All Users-endpoint",
        data: {
            userArray: userArray
        }
    });
    //Return list users
})

router.get('/profile', (req, res) =>
    res.json({
        status: "200",
        message: "Profile-endpoint",
        data: {
            email: "henk.jan@mail.nl",
            firstName: "Henk",
            lastName: "Jan",
            address: "Lovensdijkstraat 63, Breda",
            password: "rAnDoMww",
            userId: 001
        }
    })
);

router.route('/:userId')
    .get((req, res) => {
        logger.log(`Getting userdata for ${req.params.userId}`)
        switch (req.params.userId) {
            case '001':
                res.json({
                    status: "200",
                    message: "Userdata-endpoint",
                    data: {
                        email: "henk.jan@mail.nl",
                        firstName: "Henk",
                        lastName: "Jan",
                        address: "Lovensdijkstraat 63, Breda",
                        password: "rAnDoMww",
                        userId: 001
                    }
                });
                break;
            case '002':
                res.json({
                    status: "200",
                    message: "Userdata-endpoint",
                    data: {
                        email: "man.vrouw@mail.nl",
                        firstName: "Man",
                        lastName: "Vrouw",
                        address: "RandomWeg 69, Amstelveen",
                        password: "NogRaarderWacht",
                        userId: 002
                    }
                });
                break;
            default:
                res.send(`Can't find user ${req.params.userId}`)
                break;
        }
    })
    .put((req, res) => {
        res.json({
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
        res.send(`User met ID #${req.params.userId} is verwijderd`);
    })



module.exports = router;
