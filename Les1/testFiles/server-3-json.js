const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    console.log("There was a request " + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/json');
    const exampleArray = ["item1", "item2"]
    const exmapleObject = {
        item1: "item1val",
        item2: "item2val"
    };
    const json = JSON.stringify({
        anObject: exmapleObject,
        anArray: exampleArray,
        another: "item",
        tekst: "Dit is JSON!"
    })
    res.end(json);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
