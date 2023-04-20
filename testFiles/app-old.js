const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/', (req, res) => {
    res.send('Got a POST request')
})

app.put('/user', (req, res) => {
    res.send('Got a PUT request at /user')
})

app.delete('/user', (req, res) => {
    res.send('Got a DELETE request at /user')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.all('/secret', (req, res, next) => {
    console.log('Accessing the secret section ...')
    next()
})

app.get('/users/:userId/books/:bookId', (req, res) => {
    res.send(req.params)
})

app.get('/example/a', (req, res) => {
    res.send('Hello from A!')
})

app.get('/example/b', (req, res, next) => {
    console.log('the response will be sent by the next function ...')
    next()
}, (req, res) => {
    res.send('Hello from B!')
})

const cb0 = function (req, res, next) {
    console.log('CB0')
    next()
}

const cb1 = function (req, res, next) {
    console.log('CB1')
    next()
}

const cb2 = function (req, res) {
    res.send('Hello from C!')
}

app.get('/example/c', [cb0, cb1, cb2])

app.get('/example/d', [cb0, cb1], (req, res, next) => {
    console.log('the response will be sent by the next function ...')
    next()
}, (req, res) => {
    res.send('Hello from D!')
})

const birds = require('./birds.js');
app.use('/birds', birds)