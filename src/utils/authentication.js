const logger = require('tracer').colorConsole();
const Joi = require('joi');
const mysqldatabase = require('../utils/mysql-db');
const authorizationSchema = Joi.string().required();
const jwt = require('jsonwebtoken');

module.exports = {
    validateToken(req, res, next) {
        // console.log(req.headers)
        const result = authorizationSchema.validate(req.headers.authorization);
        logger.debug("Checking token");
        if (result.error != undefined) {
            logger.error(result.error.message.replace("value", "authorization"))
            res.status(401).json({
                status: 401,
                message: "Authentication-endpoint: Not Authorized, " + result.error.message.replace("value", "authorization"),
                data: {}
            });
        } else {
            jwt.verify(req.headers.authorization.split(" ")[1], process.env.jwtSecretKey, (err, payload) => {
                if(err) {
                    logger.error(`Unauthorized: ${err}`)
                    res.status(401).json({
                        status: 401,
                        message: `Verification-endpoint: Unauthorized, ${err}`,
                        data: {}
                    });
                } else {
                    logger.info("Verified token")
                    req.userId = payload.userId
                    next()
                }
            })
        }
    }
};