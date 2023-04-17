const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    const userArray = [{ name: "user1", id: 001 }, { name: "user2", id: 002 }]
    const field1 = req.query.field1;
    const field2 = req.query.field2;
    console.log(`Field 1: ${field1}, Field 2: ${field2}`)
    res.json({
        userArray: userArray
    });
    //Return list users
})

router.get('/profile', (req, res) => {
    res.json({
        email: "henk.jan@mail.nl",
        firstName: "Henk",
        lastName: "Jan",
        address: "Lovensdijkstraat 63, Breda",
        password: "rAnDoMww",
        userId: 001
    });
})

router.route('/:userId')
    .get((req, res) => {
        console.log(`Getting userdata for ${req.params.userId}`)
        switch (req.params.userId) {
            case '001':
                res.json({
                    email: "henk.jan@mail.nl",
                    firstName: "Henk",
                    lastName: "Jan",
                    address: "Lovensdijkstraat 63, Breda",
                    password: "rAnDoMww",
                    userId: 001
                });
                break;
            case '002':
                res.json({
                    email: "man.vrouw@mail.nl",
                    firstName: "Man",
                    lastName: "Vrouw",
                    address: "RandomWeg 69, Amstelveen",
                    password: "NogRaarderWacht",
                    userId: 002
                });
                break;
            default:
                res.send(`Can't find user ${req.params.userId}`)
                break;
        }
    })
    .put((req, res) => {        
        res.json({
            email: "henk.jan@mail.nl",
            firstName: "Henk",
            lastName: "Jan",
            address: "Lovensdijkstraat 63, Breda",
            password: "rAnDoMww",
            userId: 001
        });
    })
    .delete((req, res) => {        
        res.send(`User met ID #${req.params.userId} is verwijderd`);
    })



module.exports = router;
