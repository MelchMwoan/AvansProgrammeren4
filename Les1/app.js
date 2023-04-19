const express = require('express')
const config = require('./config.json');
const app = express()
const port = config.port;
const logger = require('tracer').colorConsole();

app.listen(port, () => {
    logger.debug(`Example app listening on port ${port}`)
})

app.use('/', (req, res, next) => {
    logger.log(`${req.method} request on ${req.originalUrl}`)
    next()
})

const register = require('./routes/register.js');
app.use('/api/register', register);

const user = require('./routes/user.js');
app.use('/api/user', user);