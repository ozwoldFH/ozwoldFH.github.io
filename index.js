const http = require('http');
const url = require('url');
require('dotenv').config();
const sendStaticFiles = require('./server/helper/sendStaticFiles');
const startsWith = require('./server/helper/startsWith');
const getInventory = require('./server/inventory/get');
const postInventory = require('./server/inventory/post');
const putInventory = require('./server/inventory/put');

const server = http.createServer(async (request, response) => {
    const requestUrl = url.parse(request.url, true);

    if (requestUrl.pathname === '' || requestUrl.pathname === '/' ||
        requestUrl.pathname === '/index' || requestUrl.pathname === '/index.html') {
        sendStaticFiles('./client/index.html', response);
        return;
    }
    if (requestUrl.pathname === '/form' || requestUrl.pathname === '/form.html') {
        sendStaticFiles('./client/form.html', response);
        return;
    }
    if (requestUrl.pathname.includes('.')) {
        sendStaticFiles('./client' + requestUrl.pathname, response);
        return;
    }
    if (requestUrl.pathname === '/inventory' && request.method === 'GET') {
        const data = await getInventory();
        response.writeHead(200, {'content-type': 'application/json; charset=utf-8'});
        response.end(JSON.stringify(data));
    }
    const inventoryId = Number(requestUrl.pathname.substring(11, requestUrl.pathname.length));
    if (startsWith(requestUrl.pathname, '/inventory/') && Number.isInteger(inventoryId) && request.method === 'PUT') {
        const result = await putInventory({id: inventoryId, ...requestUrl.query});
        response.writeHead(200, {'content-type': 'application/json; charset=utf-8'});
        response.end(JSON.stringify(result));
    }
    if (requestUrl.pathname === '/inventory' && request.method === 'POST') {
        var dataJSON = [];
        var data = '';
        request.on('data', function (chunk) {
            data += chunk;
        });

        request.on('end', async function () {
            dataJSON = JSON.parse(data);
            const result = await postInventory(dataJSON);
            response.writeHead(200, {'content-type': 'application/json; charset=utf-8'});
            response.end(JSON.stringify(result));
            console.log(JSON.stringify(result));
        });  
        return;     
    }

    response.writeHead(404, {});
    response.end('Endpoint not found', 'utf-8');
});


const port = process.env.PORT || 80;
server.listen(port, () => {
    console.log('Server and Notes Application is listening to http://localhost:' + port);
},);