const express = require('express')
const config = require('./config.json');
const app = express()
const port = config.port;
const logger = require('tracer').colorConsole();

app.listen(port, () => {
    logger.debug(`Example app listening on port ${port}`)
})

app.use('*', (req, res, next) => {
    logger.log(`${req.method} request on ${req.originalUrl}`)
    next()
})

const register = require('./routes/register.js');
app.use('/api/register', register);
const user = require('./routes/user.js');
app.use('/api/user', user.router);
const info = require('./routes/info.js');
app.use('/api/info', info);

app.use('*',(req, res) => {
    logger.error(`${req.method} request on ${req.originalUrl} was not found`)
    res.status(404).json({
        status: 404,
        message: "Endpoint not found",
        data: {}
    })
})

module.exports = app;