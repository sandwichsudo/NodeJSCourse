/*
    Common validators lib
*/

const validators = {};

validators.validateString = (field) => {
    return typeof(field) == 'string' && field.trim().length > 0 ? field.trim() : false;
}

validators.validatePhone = (field) => {
    return typeof(field) == 'string' && field.trim().length == 10 ? field : false; 
}

validators.validateBool = (field) => {
    return typeof(field) == 'boolean' && field == true;
}

module.exports = validators;