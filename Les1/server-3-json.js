const { timeStamp, timeLog } = require('console');
var http = require('http');


http.createServer(function(request, response) {
    console.log("There was a request " + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());
    response.writeHead(200, {'Content-Type': 'text/json'});
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
    response.end(json);
}).listen(3000);

console.log('Listening to port 3000');