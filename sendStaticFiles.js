const fs = require('fs');
const path = require('path');

function send(relativePath, response) {
    const contentType = getContentType(path.extname(relativePath));

    fs.readFile(relativePath, 'utf8', function (error, content) {
        if (error) {
            if (error.code === 'ENOENT') {
                response.writeHead(404, {'Content-Type': contentType});
                response.end('File not found', 'utf-8');
            } else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: ' + error.code);
            }
        } else {
            response.writeHead(200, {'Content-Type': contentType});
            response.end(content, 'utf-8');
        }
    });
}

function getContentType(extname) {
    switch (extname) {
        case '.js':
            return 'text/javascript';
            break;
        case '.css':
            return 'text/css';
            break;
        case '.json':
            return 'application/json';
            break;
        case '.png':
            return 'image/png';
            break;
        case '.jpg':
            return 'image/jpg';
            break;
        case '.wav':
            return 'audio/wav';
            break;
    }

    return 'text/html';
}

module.exports = send;