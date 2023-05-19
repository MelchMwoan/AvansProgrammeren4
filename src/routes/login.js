const express = require('express')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const router = express.Router()
const logger = require('tracer').colorConsole();
const Joi = require('joi');
const mysqldatabase = require('../utils/mysql-db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const schema = Joi.object({
    emailAddress: Joi.string().pattern(/^[A-Z]{1}\.[A-Z0-9]{2,}@[A-Z0-9]{2,}\.[A-Z]{2,3}$/i).required().messages({ 'string.pattern.base': `\"emailAddress\" must be a valid email` }),
    emailAdress: Joi.string().pattern(/^[A-Z]{1}\.[A-Z0-9]{2,}@[A-Z0-9]{2,}\.[A-Z]{2,3}$/i).messages({ 'string.pattern.base': `\"emailAddress\" must be a valid email` }),
    password: Joi.string().pattern(/^(?=.*[0-9])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,}$/).required().messages({ 'string.pattern.base': `{:[.]} is not a valid password (at least 1 number and 1 capital, 8 minimum characters)` })
})

router.post('/', jsonParser, (req, res, next) => {
    const result = schema.validate(req.body);
    logger.debug("Received data for login: " + JSON.stringify(result.value))
    if (result.error != undefined) {
        logger.error(result.error.message)
        res.status(400).json({
            status: 400,
            message: "Login-endpoint: Bad Request, " + result.error.message,
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
                conn.query(sqlStatement, async function (err, results, fields) {
                    if (err) {
                        logger.error(err.message);
                        next({
                            code: 409,
                            message: err.message
                        });
                    }
                    if (results.length == 0) {
                        logger.error(`User with email ${req.body.emailAddress} does not exist`)
                        res.status(404).json({
                            status: 404,
                            message: `Login-endpoint: Not Found, user with email: '${req.body.emailAddress}' does not exist`,
                            data: {}
                        });
                    } else {
                        if (bcrypt.compareSync(req.body.password, results[0].password)) {
                            let user = (({ password, ...o }) => o)(results[0]);
                            const payload = {
                                userId: user.id
                            };
                            jwt.sign(payload, process.env.jwtSecretKey, { expiresIn: '1d' }, (err, token) => {
                                if(err) {
                                    logger.error(`JWT Error: ${err}`)
                                    res.status(409).json({
                                        status: 409,
                                        message: `Login-endpoint: JWT Error, please contact a server administrator`,
                                        data: {}
                                    });
                                }else {
                                    logger.info(`User with email ${req.body.emailAddress} is succesfully logged in`)
                                    user.token = token;
                                    user.isActive = user.isActive == 1 ? true : false;
                                    res.status(200).json({
                                        status: 200,
                                        message: `Login-endpoint: OK, welcome ${results[0].firstName} ${results[0].lastName}`,
                                        data: user
                                    });
                                }
                            })
                        } else {
                            logger.error(`User with email ${req.body.emailAddress} tried to login with an invalid password`)
                            res.status(400).json({
                                status: 400,
                                message: `Login-endpoint: Bad Request, invalid password`,
                                data: {}
                            });
                        }
                    }
                });
                mysqldatabase.releaseConnection(conn);
            }
        })
    }
})

module.exports = router;
