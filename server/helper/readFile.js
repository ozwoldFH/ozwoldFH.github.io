const fs = require('fs');

function read(relativePath, encoding = 'utf8') {
    return new Promise((resolve, reject) => {
        fs.readFile(relativePath, encoding, function (error, content) {
            if (error) {
                if (error.code === 'ENOENT') {
                    reject({code: 404, message: 'File not found'});
                } else {
                    reject({code: 500, message: 'Sorry, check with the site admin for error: ' + error.code});
                }
            } else {
                resolve(content);
            }
        });
    });
}

module.exports = read;