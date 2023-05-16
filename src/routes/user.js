const express = require('express')
const router = express.Router()
const logger = require('tracer').colorConsole();
const mysqldatabase = require('../utils/mysql-db');
const Joi = require('joi');
const tokenSchema = Joi.string().token().required();
const emailSchema = Joi.string().pattern(/^[A-Z]{1}\.[A-Z0-9]{2,}@[A-Z0-9]{2,}\.[A-Z]{2,3}$/i).required().messages({ 'string.pattern.base': `\"emailAddress\" must be a valid email` })
const phoneSchema = Joi.string().pattern(/^06[\s\-]?[0-9]{8}$/).required().messages({ 'string.pattern.base': `{:[.]} is not a valid phone number (starts with 06 and contains 10 digits in total)` });
const schema = Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30).required(),
    street: Joi.string().min(3).max(30).required(),
    city: Joi.string().min(3).max(30).required(),
    isActive: Joi.boolean(),
    emailAddress: Joi.string().pattern(/^[A-Z]{1}\.[A-Z0-9]{2,}@[A-Z0-9]{2,}\.[A-Z]{2,3}$/i).required().messages({ 'string.pattern.base': `\"emailAddress\" must be a valid email` }),
    password: Joi.string().pattern(/^(?=.*[0-9])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,}$/).required().messages({ 'string.pattern.base': `{:[.]} is not a valid password (at least 1 number and 1 capital, 8 minimum characters)` }),
    phoneNumber: Joi.string().pattern(/^06[\s\-]?[0-9]{8}$/).required().messages({ 'string.pattern.base': `{:[.]} is not a valid phone number (starts with 06 and contains 10 digits in total)` })
})

router.route('/')
.get((req, res, next) => {
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
}).post((req, res, next) => {
    const result = schema.validate(req.query);
    logger.debug("Received data for register: " + JSON.stringify(result.value))
    if (result.error != undefined) {
        logger.error(result.error.message)
        res.status(400).json({
            status: 400,
            message: "Register-endpoint: Bad Request, " + result.error.message,
            data: {}
        });
    } else {
        let sqlStatement = `Select * FROM \`user\` WHERE \`emailAddress\`='${req.query.emailAddress}'`;
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
                        logger.error(`User with email ${req.query.emailAddress} already exists`)
                        res.status(403).json({
                            status: 403,
                            message: `Register-endpoint: Forbidden, user with email: '${req.query.emailAddress}' already exists`,
                            data: {}
                        });
                    } else {
                        sqlStatement = `INSERT INTO \`user\` (firstName,lastName,isActive,emailAddress,password,phoneNumber,street,city) VALUES ('${req.query.firstName}','${req.query.lastName}',${(req.query.isActive == undefined ? true : req.query.isActive)},'${req.query.emailAddress}','${req.query.password}','${req.query.phoneNumber}','${req.query.street}','${req.query.city}')`;
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
                                        logger.info(`User with id #${results[0].id} has been created`)
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


router.get('/profile', (req, res) => {
    //TODO: Implement token usage (authorization)
    //TODO: Use mysql
    const result = tokenSchema.validate(req.query.token);
    if (result.error != undefined) {
        logger.error(result.error.message.replace("value", "token"))
        res.status(401).json({
            status: 401,
            message: `Profile-endpoint: Unauthorized, ${result.error.message.replace("value", "token")}`,
            data: {}
        })
    } else {
        if (true) {
            logger.info(`User with token ${req.query.token} called profile info`)
            res.status(200).json({
                status: 200,
                message: "Profile-endpoint: This function is not implemented yet",
                data: {}
            })
        } else {
            //Run on invalid token
            logger.error(`Token ${req.query.token} is invalid`)
            res.status(401).json({
                status: 401,
                message: `Profile-endpoint: Unauthorized, Invalid token ${req.query.token}`,
                data: {}
            })
        }
    }
}
);

router.route('/:userId')
    .get((req, res, next) => {
        //TODO: check token 401
        const result = tokenSchema.validate(req.query.token);
        if (result.error != undefined) {
            logger.error(result.error.message.replace("value", "token"))
            res.status(401).json({
                status: 401,
                message: `Userdata-endpoint: Unauthorized, ${result.error.message.replace("value", "token")}`,
                data: {}
            })
        } else {
            logger.info(`User with token ${req.query.token} called get userdata for: ${req.params.userId}`)
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
                            let returnuser = (({ password, ...o }) => o)(results[0])
                            //If query trigger is owner of account => returnuser = user; (for password)
                            res.status(200).json({
                                status: 200,
                                message: `Userdata-endpoint: User info for #${returnuser.id}`,
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
        }
    })
    .put((req, res, next) => {
        //TODO: Check ownership through token 403
        //TODO: Check logged in
        const result = emailSchema.validate(req.query.emailAddress);
        if (result.error != undefined) {
            logger.error(result.error.message.replace("value", "emailAddress"))
            res.status(400).json({
                status: 400,
                message: `Userdata Update-endpoint: Bad Request, ${result.error.message.replace("value", "emailAddress")}`,
                data: {}
            });
        } else {
            if (req.query.phoneNumber != undefined) {
                const result = phoneSchema.validate(req.query.phoneNumber);
                if (result.error != undefined) {
                    logger.error(result.error.message.replace("value", "phoneNumber"))
                    res.status(400).json({
                        status: 400,
                        message: `Userdata Update-endpoint: Bad Request, ${result.error.message.replace("value", "phoneNumber")}`,
                        data: {}
                    });
                }
            }
            if (!res.headersSent) {
                const userId = req.params.userId;
                logger.info(`User with token ${req.query.token} called update userdata for: ${req.params.userId}`)
                let sqlStatement = `Select * FROM \`user\` WHERE \`id\`=${req.params.userId} AND \`emailAddress\`='${req.query.emailAddress}'`;
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
                                logger.info(`Found user with id #${userId}`);
                                let user = results[0]
                                let sqlStatement = `UPDATE \`user\` SET`;
                                for (let [key, value] of Object.entries((({ emailAddress, ...o }) => o)(req.query))) {
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
                                sqlStatement += ` WHERE \`id\`=${req.params.userId} AND \`emailAddress\`='${req.query.emailAddress}'`;
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
                            } else {
                                logger.error(`User with id #${userId} and email ${req.query.emailAddress} not found`)
                                res.status(404).json({
                                    status: 404,
                                    message: `Userdata Update-endpoint: Not Found, User with id #${userId} and email ${req.query.emailAddress} not found`,
                                    data: {}
                                });
                            }
                        });
                        mysqldatabase.releaseConnection(conn);
                    }
                })
            }
        }
    })
    .delete((req, res, next) => {
        //TODO: Check logged in
        //TODO: Check ownership through authorization
        const result = tokenSchema.validate(req.query.token);
        if (result.error != undefined) {
            logger.error(result.error.message.replace("value", "token"))
            res.status(401).json({
                status: 401,
                message: `Userdata Delete-endpoint: Unauthorized, ${result.error.message.replace("value", "token")}`,
                data: {}
            })
        } else {
            logger.info(`User with token ${req.query.token} called delete userdata for: ${req.params.userId}`)
            let sqlStatement = `DELETE FROM \`user\` WHERE \`id\`=${req.params.userId}`;
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
                            logger.info(`User with ID #${req.params.userId} succesfully deleted`)
                            res.status(200).json({
                                status: 200,
                                message: `Userdata Delete-endpoint: User with ID #${req.params.userId} succesfully deleted`,
                                data: {}
                            });
                        } else {
                            logger.error(`User with id #${req.params.userId} does not exist`)
                            res.status(404).json({
                                status: 404,
                                message: `Userdata Delete-endpoint: Not Found, User with ID #${req.params.userId} not found`,
                                data: {}
                            });
                        }
                    });
                    mysqldatabase.releaseConnection(conn);
                }
            })
        }
    })

module.exports = router;
