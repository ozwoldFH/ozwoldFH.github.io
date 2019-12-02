const path = require('path');
const readFile = require('./readFile');

async function send(relativePath, response) {
    const contentType = getContentType(path.extname(relativePath));

    try {
        const content = await readFile(relativePath);
        response.writeHead(200, {'Content-Type': contentType});
        response.end(content, 'utf-8');
    } catch (err) {
        response.writeHead(err.code, {'Content-Type': contentType});
        response.end(err.message, 'utf-8');
    }
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