const express = require('express')
const router = express.Router()
const logger = require('tracer').colorConsole();

router.post('/', (req, res) => {
    res.json({
        status: "200",
        message: "Register-endpoint",
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

module.exports = router;
