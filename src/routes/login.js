const express = require('express')
const router = express.Router()
const logger = require('tracer').colorConsole();
const Joi = require('joi');
const mysqldatabase = require('../utils/mysql-db');
const schema = Joi.object({
    emailAdress: Joi.string().email().required(),
    password: Joi.string().required()
})
const jwt = require('jsonwebtoken');

router.post('/', (req, res, next) => {
    const result = schema.validate(req.query);
    logger.debug("Received data for login: " + JSON.stringify(result.value))
    if (result.error != undefined) {
        logger.error(result.error.message)
        res.status(400).json({
            status: 400,
            message: "Login-endpoint: Bad Request, " + result.error.message,
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
                    if (results.length == 0) {
                        logger.error(`User with email ${req.query.emailAdress} does not exist`)
                        res.status(403).json({
                            status: 403,
                            message: `Login-endpoint: Forbidden, user with email: '${req.query.emailAdress}' does not exist`,
                            data: {}
                        });
                    } else {
                        logger.debug(results[0].password)
                        // sqlStatement = `INSERT INTO \`user\` (firstName,lastName,isActive,emailAdress,password,phoneNumber,street,city) VALUES ('${req.query.firstName}','${req.query.lastName}',${(req.query.isActive == undefined ? true : req.query.isActive)},'${req.query.emailAdress}','${req.query.password}','${req.query.phoneNumber}','${req.query.street}','${req.query.city}')`;
                        // logger.debug(sqlStatement)
                        // conn.query(sqlStatement, function (err, results, fields) {
                        //     if (err) {
                        //         logger.error(err.message);
                        //         next({
                        //             code: 409,
                        //             message: err.message
                        //         });
                        //     }
                        //     if (results.affectedRows > 0) {
                        //         sqlStatement = `Select * FROM \`user\` WHERE \`id\`='${results.insertId}'`;
                        //         conn.query(sqlStatement, function (err, results, fields) {
                        //             if (err) {
                        //                 logger.error(err.message);
                        //                 next({
                        //                     code: 409,
                        //                     message: err.message
                        //                 });
                        //             }
                        //             if (results.length > 0) {
                        //                 logger.info(`User with id #${results[0].id} has been created`)
                        //                 res.status(201).json({
                        //                     status: 201,
                        //                     message: "Register-endpoint: Created, succesfully created a new user",
                        //                     data: results[0]
                        //                 });
                        //             }
                        //         });
                        //     }
                        // });
                    }
                });
                mysqldatabase.releaseConnection(conn);
            }
        })
    }
})

module.exports = router;
