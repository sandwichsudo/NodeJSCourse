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
handlers.users = async (data) => {
    const acceptableMethods = ['post', 'put', 'delete', 'get'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        return await handlers._users[data.method](data);
    } else {
        return {
            statusCode: 405
        }
    }
}

handlers._users = users;

module.exports = handlers;