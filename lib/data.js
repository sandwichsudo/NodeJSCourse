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
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
        if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData)
        } else {
            callback(err, data)
        }
    })
}

// Update a file of exisiting data
lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            var stringData = JSON.stringify(data);
            
            // Truncate the contents of the file
            fs.truncate(fileDescriptor, () => {
                if (!err) {
                    // write to file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, () => {
                                if (!err) {
                                    callback(false)
                                } else {
                                    callback('Error closing the file')
                                }
                            })
                        } else {
                            callback('Error writing to exisiting file')
                        }
                    })
                } else {
                    callback('Error truncating file')
                }
            })
        } else {
            callback('Could not open the file for updating, it may not exist yet')
        }
    })
}

// Delete a file
lib.delete = (dir, file, callback) => {
    // Unlink the file
    fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Could not delete file')
        }
    })
}

module.exports = lib;