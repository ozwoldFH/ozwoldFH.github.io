const path = require('path');
const fs = require('fs');

async function send(relativePath, response) {
    const extname = path.extname(relativePath);
    const contentType = getContentType(extname);

    try {
        const stat = fs.statSync(relativePath);
        response.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stat.size
        });

        const readStream = fs.createReadStream(relativePath);
        readStream.pipe(response);
        return null;
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw {
                code: 404,
                message: 'File not found',
            };
        } else {
            throw {
                code: 500,
                message: 'Sorry, check with the site admin for error: ' + err.code,
            };
        }
    }
}

function getContentType(extname) {
    switch (extname) {
        case '.html':
            return 'text/html';
            break;
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
        case '.ico':
            return null;
            return 'image/ico';
            break;
        case '.wav':
            return 'audio/wav';
            break;
    }

    return 'file/' + extname.slice(1);
}

module.exports = send;