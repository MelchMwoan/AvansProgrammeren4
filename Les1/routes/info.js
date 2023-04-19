const express = require('express')
const router = express.Router()
const logger = require('tracer').colorConsole();

router.get('/', (req, res) => {
    res.status(200).json({
        status: 200,
        message: "Server Info-endpoint",
        data: {
            studentName: "Melchior Willenborg",
            studentNumber: "2205378",
            description: "Dit is de ShareAMeal API voor programmeren 4"
        }
    });
})

module.exports = router;
