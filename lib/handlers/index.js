/*
These are the request handlers
*/
const users = require('./users')
// Dependencies

// Define the handlers
const handlers = {};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}

// Ping handler
handlers.ping = (data, callback) => {
    callback(200)
}

// Ping handler
handlers.users = (data, callback) => {
    const acceptableMethods = ['post', 'put', 'delete', 'get'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405)
    }
}

handlers._users = users;



module.exports = handlers;