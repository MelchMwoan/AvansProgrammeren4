const express = require('express')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const router = express.Router()
const authentication = require('../utils/authentication');
const mealController = require('../controllers/meal.controller');

router.route('/')
    .post(authentication.validateToken, jsonParser, mealController.createMeal)
    .get(jsonParser, mealController.getAllMeals)

router.route('/:mealId')
    .get(jsonParser, mealController.getMealById)
    .delete(authentication.validateToken, jsonParser, mealController.deleteMealById)
    .put(authentication.validateToken, jsonParser, mealController.updateMealById)

router.route('/:mealId/participate')
    .post(authentication.validateToken, jsonParser, mealController.createParticipation)
    .delete(authentication.validateToken, jsonParser, mealController.deleteParticipation)
router.get('/:mealId/participants', authentication.validateToken, jsonParser, mealController.getAllParticipants)
router.get('/:mealId/participants/:participantId', authentication.validateToken, jsonParser, mealController.getParticipantDetailsById)

module.exports = router;
