const express = require('express')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const router = express.Router()
const logger = require('tracer').colorConsole();
const mysqldatabase = require('../utils/mysql-db');
const Joi = require('joi').extend(require('@joi/date'));
const authentication = require('../utils/authentication');
const schema = Joi.object({
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(3).max(400).required(),
    isActive: Joi.boolean(),
    isVega: Joi.boolean(),
    isVegan: Joi.boolean(),
    isToTakeHome: Joi.boolean(),
    dateTime: Joi.date().format('YYYY-MM-DD HH:mm:ss').required(),
    maxAmountOfParticipants: Joi.number().integer().required(),
    price: Joi.number().required(),
    imageUrl: Joi.string().uri().max(255).required(),
    allergenes: Joi.array().items(Joi.string().valid('gluten','lactose','noten'))
})

router.route('/')
    .post(authentication.validateToken, jsonParser, (req, res, next) => {
        const result = schema.validate(req.body);
        logger.debug("Received data for create meal: " + JSON.stringify(result.value))
        if (result.error != undefined) {
            logger.error(result.error.message)
            res.status(400).json({
                status: 400,
                message: "Create Meal-endpoint: Bad Request, " + result.error.message,
                data: {}
            });
        } else {
            let sqlStatement = `INSERT INTO \`meal\` (isActive,isVega,isVegan,isToTakeHome,dateTime,maxAmountOfParticipants,price,imageUrl,cookId,createDate,updateDate,name,description,allergenes) VALUES (${req.body.isActive == undefined ? true : req.body.isActive},${req.body.isVega == undefined ? false : req.body.isVega},${req.body.isVegan == undefined ? false : req.body.isVegan},${req.body.isToTakeHome == undefined ? false : req.body.isToTakeHome},FROM_UNIXTIME(${req.body.dateTime}),${req.body.maxAmountOfParticipants},${req.body.price},'${req.body.imageUrl}',${req.userId},FROM_UNIXTIME(${req.body.createDate == undefined ? parseInt(new Date().getTime()/1000) : req.body.createDate}),FROM_UNIXTIME(${req.body.updateDate == undefined ? parseInt(new Date().getTime()/1000) : req.body.updateDate}),'${req.body.name}','${req.body.description}',${req.body.allergenes == undefined ? "''" : req.body.allergenes})`;
            logger.debug(sqlStatement)
            mysqldatabase.getConnection(function (err, conn) {
                if (err) {
                    logger.error(`MySQL error: ${err}`);
                    next(`MySQL error: ${err.message}`)
                }
                if (conn) {
                    logger.debug(sqlStatement)
                    conn.query(sqlStatement, function (err, results, fields) {
                        if (err) {
                            logger.error(err.message);
                            next({
                                code: 409,
                                message: err.message
                            });
                        } else if (results.affectedRows > 0) {
                            sqlStatement = `Select * FROM \`meal\` WHERE \`id\`='${results.insertId}'`;
                            conn.query(sqlStatement, function (err, results, fields) {
                                if (err) {
                                    logger.error(err.message);
                                    next({
                                        code: 409,
                                        message: err.message
                                    });
                                }
                                if (results.length > 0) {
                                    logger.info(`Meal with id #${results[0].id} has been created`);
                                    res.status(201).json({
                                        status: 201,
                                        message: "Create Meal-endpoint: Created, succesfully created a new meal",
                                        data: results[0]
                                    });
                                }
                            });
                        }
                    });
                    mysqldatabase.releaseConnection(conn);
                }
            })
        }
    })

module.exports = router;
