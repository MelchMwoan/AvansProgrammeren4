const express = require('express')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const router = express.Router()
const authentication = require('../utils/authentication');
const userController = require('../controllers/user.controller');

router.route('/')
    .get(authentication.validateToken, jsonParser, userController.getAllUsers)
    .post(jsonParser, userController.registerUser)

router.get('/profile', authentication.validateToken, jsonParser, userController.getProfile);

router.route('/:userId')
    .get(authentication.validateToken, jsonParser, userController.getUserById)
    .put(authentication.validateToken, jsonParser, userController.updateUserById)
    .delete(authentication.validateToken, jsonParser, userController.deleteUserById)

module.exports = router;
