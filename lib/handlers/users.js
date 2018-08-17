const validators = require('./validators')
const _data = require('../data');
const helpers = require('../helpers');
const errors = require('../errors')
// Container for the users submethods
const STORAGE_NAME = 'users';
users = {};

// Users - post
// Required fields: firstName, lastName, phone, password, tosAgreement
users.post = async (data) => {
    // check that all required fields are filled out
    let payload = {};
    
    const {
        firstName, 
        lastName,
        phone,
        password,
        tosAgreement
    } = data.payload;
    
    console.log('payload', data.payload)

    var _firstName = validators.validateString(firstName);
    var _lastName = validators.validateString(lastName);
    var _phone = validators.validatePhone(phone);
    var _password = validators.validateString(password);
    var _tosAgreement = validators.validateBool(tosAgreement);
    console.log(_firstName , _lastName , _phone , _password , tosAgreement)
    if (_firstName && _lastName && _phone && _password && tosAgreement) {
        
        // Hash the password
        const hashedPassword = helpers.hash(password);
        if (hashedPassword) {
            // Create the user object
            const userObject = {
                firstName: _firstName,
                lastName: _lastName,
                phone: _phone,
                hashedPassword,
                tosAgreement: true,
            };
            console.log('userObject', userObject)
            try {
                let { err } = await _data.create(STORAGE_NAME, _phone, userObject);
                if (!err) {
                    statusCode = 200;
                } else {
                    statusCode = 400;
                    payload = errors.createError(err);
                    if (err.indexOf('exist') > -1) {
                        payload = errors.createError('A user with that phone number already exists');
                    }
                }
            } catch (e) {
                console.log(e)
            }
        
        } else {
            statusCode = 500;
            payload = errors.createError('Could not hash password');
        }
    } else {
        statusCode = 400;
        payload = errors.missingRequiredFields(['firstName', 'lastName', 'phone', 'password', 'tosAgreement']);
    }
    console.log('returning ',statusCode, payload)
    return {
        statusCode,
        payload,
    }
}

/* Users - get 
    Required data: phone
    Optional data: none
    TODO: only let an authenticated user access their object, don't let them access anyone elses
*/
users.get = (data, callback) => {
    // Check that the phone number provided is valid
    const phone = data.queryStringObject.phone;
    var _phone = validators.validatePhone(phone);
    if (_phone) {
        _data.read('users', phone, (err, fileData) => {
            if (!err && fileData) {
                // Remove the hashed password from the user object before returning the user
                delete data.hashedPassword;
                callback(200, fileData)
            } else {
                callback(404)
            }
        })
    } else {
        callback(400, errors.missingRequiredFields())
    }
}

/* Users - put */
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// TODO: only let an authenticated user update their own object - don't let them update anyone elses
users.put = (data, callback) => {
    // check for the required fields
    const {
        firstName, 
        lastName,
        password,
        phone
    } = data.payload;

    var _phone = validators.validatePhone(phone);

    // check for the optional fields
    var _firstName = validators.validateString(firstName);
    var _lastName = validators.validateString(lastName);
    var _password = validators.validatePassword(password);

    // err if the phone is invalid
    if (_phone) {
        if (_firstName || _lastName || _password) {
            _data.read('users', _phone, (err, userData) => {
                if (!err && userData) {
                    if (_firstName) {
                        userData.firstName = _firstName;
                    }
                    if (_lastName) {
                        userData.lastName = _lastName;
                    }
                    if (_password) {
                        userData.hashedPassword = helpers.hash(_password);
                    }
                    
                    _data.update('users', _phone, userData, (err) => {
                        if (!err) {
                            callback(200)
                        } else {
                            console.log(err);
                            callback(500, errors.createError('Could not update the user'))
                        }
                    })
                } else {
                    callback(400, errors.userNotFound(phone))
                }
            });
        } else {
            callback(400, errors.missingRequiredFields(['firstName', 'lastName', 'password']))
        }
    } else {
        callback(400, errors.missingRequiredFields(['phone']))
    }
}

/* Users - delete */

// Required field: phone
//TODO: Only let an authenticated user delete their object, don't let them delete anyone elses
//TODO: Clean up any other data files associated this user
users.delete = (data, callback) => {
    // Check that the phone number provided is valid
    const phone = data.payload.phone;
    var _phone = validators.validatePhone(phone);
    if (_phone) {
        _data.read('users', phone, (err, fileData) => {
            if (!err && fileData) {
                // Remove the hashed password from the user object before returning the user
                _data.delete('users', phone, (err) => {
                    if (!err) {
                        callback(200)
                    } else {
                        callback(500, errors.createError('Could not delete the user with number ', _phone))
                    }
                })
            } else {
                callback(400, errors.userNotFound(_phone))
            }
        })
    } else {
        callback(400, errors.missingRequiredFields(['phone']))
    }
    
}

module.exports = users;