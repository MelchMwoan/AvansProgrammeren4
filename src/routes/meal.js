const express = require('express')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const router = express.Router()
const logger = require('tracer').colorConsole();
const mysqldatabase = require('../utils/mysql-db');
const Joi = require('joi').extend(require('@joi/date'));
const authentication = require('../utils/authentication');
const { array } = require('joi');
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
    allergenes: Joi.array().items(Joi.string().valid('gluten', 'lactose', 'noten'))
})
const updateSchema = Joi.object({
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(3).max(400),
    isActive: Joi.boolean(),
    isVega: Joi.boolean(),
    isVegan: Joi.boolean(),
    isToTakeHome: Joi.boolean(),
    dateTime: Joi.date().format('YYYY-MM-DD HH:mm:ss'),
    maxAmountOfParticipants: Joi.number().integer().required(),
    price: Joi.number().required(),
    imageUrl: Joi.string().uri().max(255),
    allergenes: Joi.array().items(Joi.string().valid('gluten', 'lactose', 'noten'))
})
router.route('/')
    .post(authentication.validateToken, jsonParser, (req, res, next) => {
        try {
            req.body.dateTime = parseInt(new Date(req.body.dateTime).getTime())
            if (req.body.dateTime.toString().length == 13) {
                req.body.dateTime = parseInt(req.body.dateTime / 1000)
            }
        } catch (error) {
            logger.error(error)
        }
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
            let sqlStatement = `INSERT INTO \`meal\` (isActive,isVega,isVegan,isToTakeHome,dateTime,maxAmountOfParticipants,price,imageUrl,cookId,createDate,updateDate,name,description,allergenes) VALUES (${req.body.isActive == undefined ? true : req.body.isActive},${req.body.isVega == undefined ? false : req.body.isVega},${req.body.isVegan == undefined ? false : req.body.isVegan},${req.body.isToTakeHome == undefined ? false : req.body.isToTakeHome},FROM_UNIXTIME(${req.body.dateTime}),${req.body.maxAmountOfParticipants},${req.body.price},'${req.body.imageUrl}',${req.userId},FROM_UNIXTIME(${parseInt(new Date().getTime() / 1000)}),FROM_UNIXTIME(${parseInt(new Date().getTime() / 1000)}),'${req.body.name}','${req.body.description}',${req.body.allergenes == undefined ? "''" : "'" + req.body.allergenes + "'"})`;
            logger.debug(sqlStatement)
            mysqldatabase.getConnection(function (err, conn) {
                if (err) {
                    logger.error(`MySQL error: ${err}`);
                    next(`MySQL error: ${err.message}`)
                }
                if (conn) {
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
                                    results[0].price = results[0].price.replace("'", '')
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
    .get(jsonParser, (req, res, next) => {
        let sqlStatement = 'Select * FROM `meal`';
        logger.debug(sqlStatement)
        mysqldatabase.getConnection(function (err, conn) {
            if (err) {
                logger.error(`MySQL error: ${err}`);
                next(`MySQL error: ${err.message}`)
            }
            if (conn) {
                conn.query(sqlStatement, function (err, results, fields) {
                    if (err) {
                        logger.error(err.message);
                        next({
                            code: 200,
                            message: err.message,
                            data: []
                        });
                    } else if (results) {
                        let size = results.length
                        logger.info(`Found ${size} results`);
                        for (let i = 0; i < size; i++) {
                            sqlStatement = `Select * FROM \`user\` WHERE \`id\`=${results[i].cookId}`
                            conn.execute(sqlStatement, function (err, results2, fields) {
                                results[i].cook = (({ password, ...o }) => o)(results2[0])
                                results[i] = (({ cookId, ...o }) => o)(results[i])
                                //TODO: optimize
                                //TODO: participants
                                if (i + 1 == size) {
                                    res.status(200).json({
                                        status: 200,
                                        message: "All Meals-endpoint",
                                        data: results
                                    });
                                }
                            })
                        }
                    }
                });
                mysqldatabase.releaseConnection(conn);
            }
        })
    })

router.route('/:mealId')
    .get(jsonParser, (req, res, next) => {
        let sqlStatement = `Select * FROM \`meal\` WHERE \`id\`=${req.params.mealId}`;
        logger.debug(sqlStatement)
        mysqldatabase.getConnection(function (err, conn) {
            if (err) {
                logger.error(`MySQL error: ${err}`);
                next(`MySQL error: ${err.message}`)
            }
            if (conn) {
                conn.query(sqlStatement, function (err, results, fields) {
                    if (err) {
                        logger.error(err.message);
                        next({
                            code: 200,
                            message: err.message,
                            data: []
                        });
                    } else if (results.length != 0) {
                        logger.info(`Found meal with id #${req.params.mealId}`);
                        sqlStatement = `Select * FROM \`user\` WHERE \`id\`=${results[0].cookId}`
                        conn.execute(sqlStatement, function (err, results2, fields) {
                            results[0].cook = (({ password, ...o }) => o)(results2[0])
                            results[0].cook.isActive = results[0].cook.isActive == 1 ? true : false
                            results[0] = (({ cookId, ...o }) => o)(results[0])
                            results[0].isActive = results[0].isActive == 1 ? true : false
                            results[0].isVega = results[0].isVega == 1 ? true : false
                            results[0].isVegan = results[0].isVegan == 1 ? true : false
                            results[0].isToTakeHome = results[0].isToTakeHome == 1 ? true : false
                            //TODO: optimize
                            //TODO: participants
                            res.status(200).json({
                                status: 200,
                                message: "Mealdata-endpoint",
                                data: results[0]
                            });
                        })
                    } else {
                        logger.error(`Meal with id #${req.params.mealId} does not exist`)
                        res.status(404).json({
                            status: 404,
                            message: `Mealdata-endpoint: Not Found, Meal with ID #${req.params.mealId} not found`,
                            data: {}
                        });
                    }
                });
                mysqldatabase.releaseConnection(conn);
            }
        })
    })
    .delete(authentication.validateToken, jsonParser, (req, res, next) => {
        mysqldatabase.getConnection(function (err, conn) {
            if (err) {
                logger.error(`MySQL error: ${err}`);
                next(`MySQL error: ${err.message}`)
            }
            if (conn) {
                let sqlStatement = `SELECT * FROM \`meal\` WHERE \`id\`=${req.params.mealId}`
                conn.query(sqlStatement, function (err, results, fields) {
                    if (err) {
                        logger.error(err.message);
                        next({
                            code: 409,
                            message: err.message
                        });
                    } else if (results.length == 0) {
                        logger.error(`Meal with id #${req.params.mealId} does not exist`)
                        res.status(404).json({
                            status: 404,
                            message: `Mealdata Delete-endpoint: Not Found, Meal with ID #${req.params.mealId} not found`,
                            data: {}
                        });
                    } else {
                        if (req.userId != results[0].cookId) {
                            logger.error(`${req.userId} tried to delete meal #${req.params.mealId} of ${results[0].cookId}`)
                            res.status(403).json({
                                status: 403,
                                message: `Mealdata Delete-endpoint: Forbidden, you are not the cook of the meal with id #${req.params.mealId}`,
                                data: {}
                            });
                        } else {
                            logger.info(`User #${req.userId} called delete meal for: ${req.params.mealId}`)
                            let sqlStatement = `DELETE FROM \`meal\` WHERE \`id\`=${req.params.mealId}`;
                            logger.debug(sqlStatement)
                            conn.query(sqlStatement, function (err, results, fields) {
                                if (err) {
                                    logger.error(err.message);
                                    next({
                                        code: 409,
                                        message: err.message
                                    });
                                } else {
                                    logger.info(`Meal with ID #${req.params.mealId} succesfully deleted`)
                                    res.status(200).json({
                                        status: 200,
                                        message: `Maaltijd met ID ${req.params.mealId} is verwijderd`,
                                        data: {}
                                    });
                                }
                            });
                        }
                    }
                });
                mysqldatabase.releaseConnection(conn);
            }
        })
    })
    .put(authentication.validateToken, jsonParser, (req, res, next) => {
        try {
            if (req.body.dateTime != undefined) {
                req.body.dateTime = parseInt(new Date(req.body.dateTime).getTime())
                if (req.body.dateTime.toString().length == 13) {
                    req.body.dateTime = parseInt(req.body.dateTime / 1000)
                }
            }
        } catch (error) {
            logger.error(error)
        }
        const result = updateSchema.validate(req.body);
        if (result.error != undefined) {
            logger.error(result.error.message)
            res.status(400).json({
                status: 400,
                message: `Mealdata Update-endpoint: Bad Request, ${result.error.message}`,
                data: {}
            });
        } else {
            logger.info(`User #${req.userId} called update mealdata for: ${req.params.mealId}`)
            let sqlStatement = `Select * FROM \`meal\` WHERE \`id\`=${req.params.mealId} `;
            logger.debug(sqlStatement)
            mysqldatabase.getConnection(function (err, conn) {
                if (err) {
                    logger.error(`MySQL error: ${err}`);
                    next(`MySQL error: ${err.message}`)
                }
                if (conn) {
                    conn.query(sqlStatement, function (err, results, fields) {
                        if (err) {
                            logger.error(err.message);
                            next({
                                code: 409,
                                message: err.message
                            });
                        } else if (results.length != 0) {
                            if (req.userId != results[0].cookId) {
                                logger.error(`${req.userId} tried to update mealdata of #${req.params.mealId}, cookId: ${results[0].cookId}`)
                                res.status(403).json({
                                    status: 403,
                                    message: `Mealdata Update-endpoint: Forbidden, you are not the cook of the meal with id #${req.params.mealId}`,
                                    data: {}
                                });
                            } else {
                                logger.info(`Found meal with id #${req.params.mealId}`);
                                let meal = results[0]
                                let sqlStatement = `UPDATE \`meal\` SET`;
                                for (let [key, value] of Object.entries(req.body)) {
                                    if (meal[key] != undefined) {
                                        logger.debug(`Changing ${key} for #${req.params.mealId} from ${meal[key]} to ${value}`)
                                        meal[key] = value;
                                        if (!['isActive', 'isVega', 'isVegan', 'isToTakeHome', 'dateTime'].includes(key)) {
                                            value = `'${value}'`
                                        } else if (key == 'dateTime') {
                                            value = `FROM_UNIXTIME(${value})`
                                        }
                                        if (!sqlStatement.endsWith("SET")) {
                                            sqlStatement += `, \`${key}\` = ${value}`;
                                        } else {
                                            sqlStatement += ` \`${key}\` = ${value}`;
                                        }
                                    } else {
                                        logger.warn(`Key ${key} is not applicable to Meal`)
                                    }
                                }
                                //TODO: update return data
                                sqlStatement += `, \`updateDate\`=FROM_UNIXTIME(${parseInt(new Date().getTime() / 1000)}) WHERE \`id\`=${req.params.mealId}`;
                                logger.debug(sqlStatement)
                                conn.query(sqlStatement, function (err, results, fields) {
                                    if (err) {
                                        logger.error(err.message);
                                        next({
                                            code: 409,
                                            message: err.message
                                        });
                                    } else {
                                        sqlStatement = `Select * FROM \`user\` WHERE \`id\`=${meal.cookId}`
                                        conn.execute(sqlStatement, function (err, results2, fields) {
                                            meal.cook = (({ password, ...o }) => o)(results2[0])
                                            meal = (({ cookId, ...o }) => o)(meal)
                                            //TODO: optimize
                                            //TODO: participants
                                            res.status(200).json({
                                                status: 200,
                                                message: `Mealdata Update-endpoint: Meal with Id #${req.params.mealId} was succesfully updated`,
                                                data: meal
                                            });
                                        })
                                    }
                                });
                            }
                        } else {
                            logger.error(`Meal with id #${req.params.mealId} does not exist`)
                            res.status(404).json({
                                status: 404,
                                message: `Mealdata Update-endpoint: Not Found, Meal with id #${req.params.mealId} does not exist`,
                                data: {}
                            });
                        }
                    });
                    mysqldatabase.releaseConnection(conn);
                }
            })
        }
    })

router.route('/:mealId/participate')
    .post(authentication.validateToken, jsonParser, (req, res, next) => {
        let sqlStatement = `Select * FROM \`meal\` WHERE \`id\`=${req.params.mealId} `;
        logger.debug(sqlStatement)
        mysqldatabase.getConnection(function (err, conn) {
            if (err) {
                logger.error(`MySQL error: ${err}`);
                next(`MySQL error: ${err.message}`)
            }
            if (conn) {
                conn.query(sqlStatement, function (err, results, fields) {
                    if (err) {
                        logger.error(err.message);
                        next({
                            code: 409,
                            message: err.message
                        });
                    } else if (results.length != 0) {
                        logger.info(`Found meal with id #${req.params.mealId}`);
                        let meal = results[0]
                        sqlStatement = `SELECT * FROM \`meal_participants_user\` WHERE \`mealId\`=${req.params.mealId}`;
                        conn.query(sqlStatement, function (err, results, fields) {
                            if (err) {
                                logger.error(err.message);
                                next({
                                    code: 409,
                                    message: err.message
                                });
                            } else {
                                let participants = results
                                if (participants.length < meal.maxParticipants) {
                                    sqlStatement = `INSERT INTO \`meal_participants_user\` (\`mealId\`, \`userId\`) VALUES (${req.params.mealId}, ${req.userId})`;
                                    conn.query(sqlStatement, function (err, results, fields) {
                                        if (err) {
                                            logger.error(err.message);
                                            next({
                                                code: 409,
                                                message: err.message
                                            });
                                        } else {
                                            res.status(200).json({
                                                status: 200,
                                                message: `User met ID #${req.userId} is aangemeld voor maaltijd met ID #${req.params.mealId}`,
                                                data: {}
                                            });
                                        }
                                    });
                                } else {
                                    res.status(409).json({
                                        status: 409,
                                        message: `Meal Participate-endpoint: Meal with Id #${req.params.mealId} is already full`,
                                        data: {}
                                    });
                                }
                            }
                        })
                    } else {
                        logger.error(`Meal with id #${req.params.mealId} does not exist`)
                        res.status(404).json({
                            status: 404,
                            message: `Meal Participate-endpoint: Not Found, Meal with id #${req.params.mealId} does not exist`,
                            data: {}
                        });
                    }
                });
                mysqldatabase.releaseConnection(conn);
            }
        })
    })
    .delete(authentication.validateToken, jsonParser, (req, res, next) => { })
router.route('/:mealId/participants')
module.exports = router;
