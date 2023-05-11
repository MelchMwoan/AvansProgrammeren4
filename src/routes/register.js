const express = require('express')
const router = express.Router()
const logger = require('tracer').colorConsole();
const Joi = require('joi');
const mysqldatabase = require('../utils/mysql-db');
const schema = Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30).required(),
    street: Joi.string().min(3).max(30).required(),
    city: Joi.string().min(3).max(30).required(),
    isActive: Joi.boolean(),
    emailAdress: Joi.string().pattern(/^[A-Z]{1}\.[A-Z0-9]{2,}\+@[A-Z0-9]{2,}\+\.[A-Z]{2,3}$/i).required(),
    password: Joi.string().pattern(/^(?=.*[0-9])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,}$/).required().messages({ 'string.pattern.base': `{:[.]} is not a valid password (at least 1 number and 1 capital, 8 minimum characters)` }),
    phoneNumber: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im).required().messages({ 'string.pattern.base': `{:[.]} is not a valid phone number` })
})

router.post('/', (req, res, next) => {
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
        let sqlStatement = `Select * FROM \`user\` WHERE \`emailAdress\`='${req.query.emailAdress}'`;
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
                        logger.error(`User with email ${req.query.emailAdress} already exists`)
                        res.status(403).json({
                            status: 403,
                            message: `Register-endpoint: Forbidden, user with email: '${req.query.emailAdress}' already exists`,
                            data: {}
                        });
                    } else {
                        sqlStatement = `INSERT INTO \`user\` (firstName,lastName,isActive,emailAdress,password,phoneNumber,street,city) VALUES ('${req.query.firstName}','${req.query.lastName}',${(req.query.isActive == undefined ? true : req.query.isActive)},'${req.query.emailAdress}','${req.query.password}','${req.query.phoneNumber}','${req.query.street}','${req.query.city}')`;
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

module.exports = router;
