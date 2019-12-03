const path = require('path');
const readFile = require('./readFile');
const fs = require('fs');

async function send(relativePath, response) {
    const extname = path.extname(relativePath);
    const contentType = getContentType(extname);

    if (contentType) {
        try {
            const content = await readFile(relativePath);
            response.writeHead(200, {'Content-Type': contentType});
            response.end(content, 'utf-8');
        } catch (err) {
            response.writeHead(err.code, {'Content-Type': contentType});
            response.end(err.message, 'utf-8');
        }
    } else {
        try {
            const stat = fs.statSync(relativePath);
            response.writeHead(200, {
                'Content-Type': 'file/' + extname.slice(1),
                'Content-Length': stat.size
            });

            const readStream = fs.createReadStream(relativePath);
            // We replaced all the event handlers with a simple call to readStream.pipe()
            readStream.pipe(response);
        } catch (err) {
            if (err.code === 'ENOENT') {
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.end('File not found', 'utf-8');
            } else {
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.end('Sorry, check with the site admin for error: ' + err.code, 'utf-8');
            }
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

    return null;
}

module.exports = send;