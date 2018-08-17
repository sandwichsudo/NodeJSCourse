/*
Create and export configuration variables
*/

const environments = {};

environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging',
    hashingSecret: 'foobarington'
};

environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production',
    hashingSecret: 'FDSFS£$FSDF$@%FSDS21!!'
};

// Determine which environment should be exported
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above. If not, default to staging
let environmentName = environments[currentEnvironment] ? currentEnvironment : 'staging';

module.exports = environments[environmentName];