const http = require('http');
const sendStaticFiles = require('./sendStaticFiles')

const server = http.createServer((request, response) => {
    const part = request.url.split('/')[1];
    switch (part) {
        case 'index.html':
        case 'form.html':
        case 'vendors':
        case 'client':
        case 'icons':
            sendStaticFiles('.' + request.url, response);
            return;
    }

    response.writeHead(302, {
        'Location': '/index.html'
    });
    response.end();
});

server.listen(8080, () =>
    console.log('Server and Notes Application is listening to http://localhost:8080'),
);