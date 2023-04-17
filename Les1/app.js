const express = require('express')
const config = require('./config.json');
const app = express()
const port = config.port;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.use('/', (req, res, next) => {
    console.log(`${req.method} request on ${req.originalUrl} at: ${new Date().toLocaleTimeString()}`)
    next()
})

const register = require('./routes/register.js');
app.use('/api/register', register);

const user = require('./routes/user.js');
app.use('/api/user', user);