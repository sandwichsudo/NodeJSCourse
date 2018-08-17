/*
    Common errors lib
*/

const errors = {};

errors.createError = (message) => ({ 'Error': message });

errors.missingRequiredFields = (fieldNames = []) => {
    const fields = fieldNames.length ? ': ' + fieldNames.join(', ') : '';
    return errors.createError(`Missing required fields${fields}`);
}

errors.userNotFound = (phone) => {
    return errors.createError(`User not found with number ${phone}`);
}

module.exports = errors;