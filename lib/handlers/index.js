/*
These are the request handlers
*/
const users = require('./users')
// Dependencies

// Define the handlers
const handlers = {};

// Not found handler
handlers.notFound = () => {
    statusCode: 200
}

// Ping handler
handlers.ping = () => {
    statusCode: 200
}

// Users handler
handlers.users = async (data) => {
    const acceptableMethods = ['post', 'put', 'delete', 'get'];
    let payload = {};
    let statusCode = 500;
    if (acceptableMethods.indexOf(data.method) > -1) {
        try {
            const response = await handlers._users[data.method](data);
            statusCode = response.statusCode;
            payload = response.payload;
        } catch (e) {
            console.log('Caught error in handlers.users:', e.message)
            payload = e.message;
        } finally {
            return {
                statusCode: statusCode,
                payload: payload,
            }
        }
    } else {
        return {
            statusCode: 405,
            payload: errors.createError(`Method ${data.method} not allowed`)
        }
    }
}

handlers._users = users;

module.exports = handlers;