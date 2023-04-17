const { timeStamp, timeLog } = require('console');
var http = require('http');


http.createServer(function(request, response) {
    console.log("There was a request " + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write('Hello World!');
    response.end();
}).listen(3000);

console.log('Listening to port 3000');