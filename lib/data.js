/*
Library for storing and editing data
*/

// Dependencies

const fs = require('fs');
const path = require('path');
const util = require('util');
const helpers = require('./helpers');

const p_open = util.promisify(fs.open);
const p_writeFile = util.promisify(fs.writeFile);
const p_readFile = util.promisify(fs.readFile);
const p_unlink = util.promisify(fs.unlink);

// Container for this module (to be exported)
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = async (dir, file, data) => {
    const filePath = `${lib.baseDir}${dir}/${file}.json`;
    // Open the file for writing
    let error = false;
    try {
        let fileDescriptor = await p_open(filePath, 'wx');
        // Convert data to string
        var stringData = JSON.stringify(data);
        // Write to file and close
        await p_writeFile(filePath, stringData);
    } catch (e) {
        if (e.code == 'EEXIST') {
            error = 'Could not create new file, it may already exist';
        } else {
            error = e.message;
        }
        console.log('caught error in lib.create', error)
    } finally {
        return { err: error };
    }
};

// Read data from a file
lib.read = async (dir, file) => {
    const filePath = `${lib.baseDir}${dir}/${file}.json`;
    let parsedData;
    let err = false;
    try {
        const data = await p_readFile(filePath, 'utf8');
        parsedData = helpers.parseJsonToObject(data);
    } catch (e) {
        err = e.message
        if (e.code == 'ENOENT') {
            err = 'File not found'
        }
    } finally {
        if (err) {
            return {
                err,
            }
        } else {
            return parsedData
        }
    }
}

lib.update = async (dir, file, data) => {
    const filePath = `${lib.baseDir}${dir}/${file}.json`;
    // Open the file for writing
    let error = false;
    try {
        let fileDescriptor = await p_open(filePath, 'r+');
        // Convert data to string
        var stringData = JSON.stringify(data);
        // Write to file and close
        await p_writeFile(filePath, stringData);
    } catch (e) {
        error = e.message;
        console.log('caught error in lib.update', error)
    } finally {
        return { err: error };
    }
};

// Delete a file
lib.delete = async (dir, file) => {
    // Unlink the file
    let err = false;
    try {
        await p_unlink(`${lib.baseDir}${dir}/${file}.json`);
    } catch (e) {
        err = e.message;
    } finally {
        return {
            err
        }
    }
}

module.exports = lib;