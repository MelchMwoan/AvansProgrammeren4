const dotenv = require('dotenv');
const logger = require('tracer').colorConsole();
if(dotenv.config().error) {
    logger.error(`Failed to load dotenv`)

}
const express = require('express')
const config = require('./config.json');
const app = express()
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const port = process.env.API_PORT || config.apiport;

app.listen(port, () => {
    logger.debug(`Share-a-Meal listening on port ${port}`)
})

app.use('*', (req, res, next) => {
    logger.log(`${req.method} request on ${req.originalUrl}`)
    next()
})

const user = require('./src/routes/user.js');
app.use('/api/user', user);
const info = require('./src/routes/info.js');
app.use('/api/info', info);

app.use('*', (req, res) => {
    logger.error(`${req.method} request on ${req.originalUrl} was not found`)
    res.status(404).json({
        status: 404,
        message: "Endpoint not found",
        data: {}
    })
})

app.use((err, req, res, next) => {
    logger.error(err.code, err.message);
    res.status(err.code).json({
        status: err.code,
        message: err.message,
        data: (err.data == undefined ? {} : err.data)
    });
});
module.exports = app;