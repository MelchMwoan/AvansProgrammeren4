const express = require('express')
const router = express.Router()
const logger = require('tracer').colorConsole();
const database = require('../utils/inmem-db');
const mysqldatabase = require('../utils/mysql-db');
const Joi = require('joi');
const tokenSchema = Joi.string().token().required();
const emailSchema = Joi.string().email().required();
const phoneSchema = Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im).required().messages({ 'string.pattern.base': `{:[.]} is not a valid phone number` });

router.get('/', (req, res, next) => {
    let sqlStatement = 'Select * FROM `user`';
    if (Object.keys(req.query).length != 0) {
        logger.debug(`Filtering on: ${Object.entries(req.query)}`)
        for (let [key, value] of Object.entries(req.query)) {
            if (key != 'isActive') {
                console.log(key, value)
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
                        code: 409,
                        message: err.message
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
                                message: "All Users-endpoint",
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
    .put((req, res) => {
        //TODO: Check ownership through token 403
        //TODO: Check logged in
        const result = emailSchema.validate(req.query.emailAdress);
        if (result.error != undefined) {
            logger.error(result.error.message.replace("value", "emailAdress"))
            res.status(400).json({
                status: 400,
                message: `Userdata Update-endpoint: Bad Request, ${result.error.message.replace("value", "emailAdress")}`,
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
                let user = database.find(user => user.id == req.params.userId && user.emailAdress == req.query.emailAdress);
                if (user == undefined) {
                    logger.error(`User with id #${req.params.userId} and email ${req.query.emailadress} not found`)
                    res.status(404).json({
                        status: 404,
                        message: `Userdata Update-endpoint: Not Found, User with id #${req.params.userId} and email ${req.query.emailAdress} not found`,
                        data: {}
                    });
                } else {
                    if (!res.headersSent) {
                        for (const [key, value] of Object.entries((({ emailAdress, ...o }) => o)(req.query))) {
                            if (user[key] != undefined) {
                                logger.debug(`Changing ${key} for #${req.params.userId} from ${user[key]} to ${value}`)
                                user[key] = value;
                            } else {
                                logger.warn(`Key ${key} is not applicable to User`)
                            }
                        }
                        res.status(200).json({
                            status: 200,
                            message: `Userdata Update-endpoint: User with Id #${req.params.userId} was succesfully updated`,
                            data: user
                        });
                    }
                }
            }
        }
    })
    .delete((req, res) => {
        //TODO: Check logged in
        //TODO: Check ownership through authorization
        database.forEach(user => {
            if (user.id == req.params.userId) {
                database.splice(database.indexOf(user), 1)
                logger.debug(`User with ID #${req.params.userId} succesfully deleted`)
                res.status(200).json({
                    status: 200,
                    message: `Userdata Delete-endpoint: User with ID #${req.params.userId} succesfully deleted`,
                    data: {}
                });
                return;
            }
        })
        if (!res.headersSent) {
            logger.error(`User with ID #${req.params.userId} does not exist`)
            res.status(404).json({
                status: 404,
                message: `Userdata Delete-endpoint: Not Found, User with ID #${req.params.userId} not found`,
                data: {}
            });
        }
    })

module.exports = router;
