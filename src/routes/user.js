const express = require('express')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const router = express.Router()
const logger = require('tracer').colorConsole();
const mysqldatabase = require('../utils/mysql-db');
const Joi = require('joi');
const authentication = require('../utils/authentication');
const schema = Joi.object({
    firstName: Joi.string().min(3).max(255).required(),
    lastName: Joi.string().min(3).max(255).required(),
    street: Joi.string().min(3).max(255).required(),
    city: Joi.string().min(3).max(255).required(),
    isActive: Joi.boolean(),
    emailAddress: Joi.string().pattern(/^[A-Z]{1}\.[A-Z0-9]{2,}@[A-Z0-9]{2,}\.[A-Z]{2,3}$/i).required().messages({ 'string.pattern.base': `\"emailAddress\" must be a valid email` }),
    emailAdress: Joi.string().pattern(/^[A-Z]{1}\.[A-Z0-9]{2,}@[A-Z0-9]{2,}\.[A-Z]{2,3}$/i).messages({ 'string.pattern.base': `\"emailAddress\" must be a valid email` }),
    password: Joi.string().pattern(/^(?=.*[0-9])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,}$/).required().messages({ 'string.pattern.base': `{:[.]} is not a valid password (at least 1 number and 1 capital, 8 minimum characters)` }),
    phoneNumber: Joi.string().pattern(/^06[\s\-]?[0-9]{8}$/).required().messages({ 'string.pattern.base': `{:[.]} is not a valid phone number (starts with 06 and contains 10 digits in total)` })
})
const updateSchema = Joi.object({
    firstName: Joi.string().min(3).max(255),
    lastName: Joi.string().min(3).max(255),
    street: Joi.string().min(3).max(255),
    city: Joi.string().min(3).max(255),
    isActive: Joi.boolean(),
    emailAddress: Joi.string().pattern(/^[A-Z]{1}\.[A-Z0-9]{2,}@[A-Z0-9]{2,}\.[A-Z]{2,3}$/i).required().messages({ 'string.pattern.base': `\"emailAddress\" must be a valid email` }),
    emailAdress: Joi.string().pattern(/^[A-Z]{1}\.[A-Z0-9]{2,}@[A-Z0-9]{2,}\.[A-Z]{2,3}$/i).messages({ 'string.pattern.base': `\"emailAddress\" must be a valid email` }),
    password: Joi.string().pattern(/^(?=.*[0-9])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,}$/).messages({ 'string.pattern.base': `{:[.]} is not a valid password (at least 1 number and 1 capital, 8 minimum characters)` }),
    phoneNumber: Joi.string().pattern(/^06[\s\-]?[0-9]{8}$/).messages({ 'string.pattern.base': `{:[.]} is not a valid phone number (starts with 06 and contains 10 digits in total)` })
})

router.route('/')
    .get(authentication.validateToken, jsonParser, (req, res, next) => {
        let sqlStatement = 'Select * FROM `user`';
        if (Object.keys(req.query).length != 0) {
            logger.debug(`Filtering on: ${Object.entries(req.query)}`)
            for (let [key, value] of Object.entries(req.query)) {
                if (key != 'isActive') {
                    value = `'${value}'`
                }
                if (!sqlStatement.includes('WHERE')) {
                    sqlStatement += ` WHERE \`${key}\`= ${value}`
                } else {
                    sqlStatement += ` AND \`${key}\`= ${value}`
                }
            }
        }
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
                    }
                    if (results) {
                        logger.info(`Found ${results.length} results`);
                        results.forEach(element => {
                            element.isActive = element.isActive == 1 ? true : false
                            element.password = undefined;
                        })
                        res.status(200).json({
                            status: 200,
                            message: "All Users-endpoint",
                            data: results
                        });
                    }
                });
                mysqldatabase.releaseConnection(conn);
            }
        })
    })
    .post(jsonParser, (req, res, next) => {
        const result = schema.validate(req.body);
        logger.debug("Received data for register: " + JSON.stringify(result.value))
        if (result.error != undefined) {
            logger.error(result.error.message)
            res.status(400).json({
                status: 400,
                message: "Register-endpoint: Bad Request, " + result.error.message,
                data: {}
            });
        } else {
            let sqlStatement = `Select * FROM \`user\` WHERE \`emailAddress\`='${req.body.emailAddress}'`;
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
                        }
                        if (results.length != 0) {
                            logger.error(`User with email ${req.body.emailAddress} already exists`)
                            res.status(403).json({
                                status: 403,
                                message: `Register-endpoint: Forbidden, user with email: '${req.body.emailAddress}' already exists`,
                                data: {}
                            });
                        } else {
                            sqlStatement = `INSERT INTO \`user\` (firstName,lastName,isActive,emailAddress,password,phoneNumber,street,city) VALUES ('${req.body.firstName}','${req.body.lastName}',${(req.body.isActive == undefined ? true : req.body.isActive)},'${req.body.emailAddress}','${req.body.password}','${req.body.phoneNumber}','${req.body.street}','${req.body.city}')`;
                            logger.debug(sqlStatement)
                            conn.query(sqlStatement, function (err, results, fields) {
                                if (err) {
                                    logger.error(err.message);
                                    next({
                                        code: 409,
                                        message: err.message
                                    });
                                }
                                if (results.affectedRows > 0) {
                                    sqlStatement = `Select * FROM \`user\` WHERE \`id\`='${results.insertId}'`;
                                    conn.query(sqlStatement, function (err, results, fields) {
                                        if (err) {
                                            logger.error(err.message);
                                            next({
                                                code: 409,
                                                message: err.message
                                            });
                                        }
                                        if (results.length > 0) {
                                            logger.info(`User with id #${results[0].id} has been created`);
                                            (results[0].isActive == true) ? results[0].isActive = true : results[0].isActive = false
                                            res.status(201).json({
                                                status: 201,
                                                message: "Register-endpoint: Created, succesfully created a new user",
                                                data: results[0]
                                            });
                                        }
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


router.get('/profile', authentication.validateToken, jsonParser, (req, res) => {
    //TODO: 3.	Het systeem zoekt de details van de bijbehorende maaltijden die vandaag of in de toekomst plaatsvinden op.
    logger.info(`User with id ${req.userId} called profile info`)
    let sqlStatement = `Select * FROM \`user\` WHERE \`id\`=${req.userId}`;
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
                } else {
                    logger.info(`Found user with id #${req.params.userId}`);
                    let returnuser = (({ password, ...o }) => o)(results[0])
                    returnuser.isActive = returnuser.isActive == 1 ? true : false
                    res.status(200).json({
                        status: 200,
                        message: `Profile-endpoint: OK, here's your profile ${returnuser.firstName}`,
                        data: returnuser
                    })
                }
            });
            mysqldatabase.releaseConnection(conn);
        }
    })
}
);

router.route('/:userId')
    .get(authentication.validateToken, jsonParser, (req, res, next) => {
        //TODO: 3.	Het systeem zoekt de details van de bijbehorende maaltijden die vandaag of in de toekomst plaatsvinden op.
        logger.info(`User #${req.userId} called get userdata for: ${req.params.userId}`)
        let sqlStatement = `Select * FROM \`user\` WHERE \`id\`=${req.params.userId}`;
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
                        logger.info(`Found user with id #${req.params.userId}`);
                        let returnuser = results[0]
                        let message = `Userdata-endpoint: User info for #${returnuser.id} - Hey! That's your own account :)`
                        if (req.params.userId != req.userId) {
                            returnuser = (({ password, ...o }) => o)(results[0])
                            message = `Userdata-endpoint: User info for #${returnuser.id}`;
                        }
                        res.status(200).json({
                            status: 200,
                            message: message,
                            data: returnuser
                        });
                    } else {
                        logger.error(`User with id #${req.params.userId} does not exist`)
                        res.status(404).json({
                            status: 404,
                            message: `Userdata-endpoint: Not Found, User with ID #${req.params.userId} not found`,
                            data: {}
                        });
                    }
                });
                mysqldatabase.releaseConnection(conn);
            }
        })
    })
    .put(authentication.validateToken, jsonParser, (req, res, next) => {
        const result = updateSchema.validate(req.body);
        if (result.error != undefined) {
            logger.error(result.error.message)
            res.status(400).json({
                status: 400,
                message: `Userdata Update-endpoint: Bad Request, ${result.error.message}`,
                data: {}
            });
        } else {
            const userId = req.params.userId;
            logger.info(`User #${req.userId} called update userdata for: ${req.params.userId}`)
            let sqlStatement = `Select * FROM \`user\` WHERE \`id\`=${req.params.userId}`;
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
                            if (req.userId != req.params.userId) {
                                logger.error(`${req.userId} tried to update data of ${req.params.userId}`)
                                res.status(403).json({
                                    status: 403,
                                    message: `Userdata Update-endpoint: Forbidden, you are not the owner of the account with id #${req.params.userId}`,
                                    data: {}
                                });
                            } else {
                                logger.info(`Found user with id #${userId}`);
                                let user = results[0]
                                let sqlStatement = `UPDATE \`user\` SET`;
                                for (let [key, value] of Object.entries((({ emailAddress, ...o }) => o)(req.body))) {
                                    if (user[key] != undefined) {
                                        logger.debug(`Changing ${key} for #${userId} from ${user[key]} to ${value}`)
                                        user[key] = value;
                                        if (key != 'isActive') {
                                            value = `'${value}'`
                                        }
                                        if (!sqlStatement.endsWith("SET")) {
                                            sqlStatement += `, \`${key}\` = ${value}`;
                                        } else {
                                            sqlStatement += ` \`${key}\` = ${value}`;
                                        }
                                    } else {
                                        logger.warn(`Key ${key} is not applicable to User`)
                                    }
                                }
                                sqlStatement += ` WHERE \`id\`=${req.params.userId}`;
                                logger.debug(sqlStatement)
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
                                            message: `Userdata Update-endpoint: User with Id #${userId} was succesfully updated`,
                                            data: user
                                        });
                                    }
                                });
                            }
                        } else {
                            logger.error(`User with id #${userId} not found`)
                            res.status(404).json({
                                status: 404,
                                message: `Userdata Update-endpoint: Not Found, User with id #${userId} not found`,
                                data: {}
                            });
                        }
                    });
                    mysqldatabase.releaseConnection(conn);
                }
            })
        }
    })
    .delete(authentication.validateToken, jsonParser, (req, res, next) => {
        mysqldatabase.getConnection(function (err, conn) {
            if (err) {
                logger.error(`MySQL error: ${err}`);
                next(`MySQL error: ${err.message}`)
            }
            if (conn) {
                let sqlStatement = `SELECT * FROM \`user\` WHERE \`id\`=${req.params.userId}`
                conn.query(sqlStatement, function (err, results, fields) {
                    if (err) {
                        logger.error(err.message);
                        next({
                            code: 409,
                            message: err.message
                        });
                    } else if (results.length == 0) {
                        logger.error(`User with id #${req.params.userId} does not exist`)
                        res.status(404).json({
                            status: 404,
                            message: `Userdata Delete-endpoint: Not Found, User with ID #${req.params.userId} not found`,
                            data: {}
                        });
                    } else {
                        if (req.userId != req.params.userId) {
                            logger.error(`${req.userId} tried to delete data of ${req.params.userId}`)
                            res.status(403).json({
                                status: 403,
                                message: `Userdata Delete-endpoint: Forbidden, you are not the owner of the account with id #${req.params.userId}`,
                                data: {}
                            });
                        } else {
                            logger.info(`User #${req.userId} called delete userdata for: ${req.params.userId}`)
                            let sqlStatement = `DELETE FROM \`meal\` WHERE \`cookId\`=${req.params.userId}`;
                            logger.debug(sqlStatement)
                            conn.query(sqlStatement, function (err, results, fields) {
                                if (err) {
                                    logger.error(err.message);
                                    next({
                                        code: 409,
                                        message: err.message
                                    });
                                } else {
                                    logger.info(`Meals with CookID #${req.params.userId} succesfully deleted`)
                                    sqlStatement = `DELETE FROM \`user\` WHERE \`id\`=${req.params.userId}`;
                                    logger.debug(sqlStatement)
                                    conn.query(sqlStatement, function (err, results, fields) {
                                        if (err) {
                                            logger.error(err.message);
                                            next({
                                                code: 409,
                                                message: err.message
                                            });
                                        } else {
                                            logger.info(`User with ID #${req.params.userId} succesfully deleted`)
                                            res.status(200).json({
                                                status: 200,
                                                message: `Gebruiker met ID ${req.params.userId} is verwijderd`,
                                                data: {}
                                            });
                                        }
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

module.exports = router;
