/*
 Primary file for API
*/

// Dependencies

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;

const config = require('./lib/config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// Define a request router
const router = {
    ...handlers
};

// Instantiate the http server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res)
});

// Start the server and have it listen on port HTTP_PORT
httpServer.listen(config.httpPort, () => {
    console.log(`The http server is listening on port ${config.httpPort} in env ${config.envName}`)
})

// Instantiate the http server
const httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem'),
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res)
});

// Start the server and have it listen on port HTTP_PORT
httpsServer.listen(config.httpsPort, () => {
    console.log(`The https server is listening on port ${config.httpsPort} in env ${config.envName}`)
})


// All the server logic for both the http and https server
const unifiedServer = (req, res) => {
    // Get the URL and parse (including query string)
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;
    
    // Get the HTTP method
    const method = req.method.toLowerCase();
    
    // Get the headers as an object
    const headers = req.headers;
    
    // Get the payload if there is any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    })
    req.on('end', () => {
        buffer += decoder.end();
        
        // Choose the handler this request should go to.
        // If one is not found, use the not found handler.
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? handlers[trimmedPath] : handlers.notFound;
        
        // construct the data object to send to the handeler
        
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: helpers.parseJsonToObject(buffer),
        }
        
        // route the request to teh handeler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code called back by the handeller, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            // Use the payload or default to empty object
            payload = typeof(payload) == 'object' ? payload : {};
            
            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);
            
            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            // Log the request payload
            console.log(`Returning this response:`, statusCode, payloadString);
        });
    });
}