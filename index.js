const http = require('http');
const url = require('url');
require('dotenv').config();
const sendStaticFiles = require('./server/helper/sendStaticFiles');
const startsWith = require('./server/helper/startsWith');
const readFile = require('./server/helper/readFile');
const dbQuery = require('./server/helper/db');
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
        const result = await postInventory(requestUrl.query);
        response.writeHead(200, {'content-type': 'application/json; charset=utf-8'});
        response.end(JSON.stringify(result));
    }

    response.writeHead(404, {});
    response.end('Endpoint not found', 'utf-8');
});

server.listen(8080, async () => {
    const createSql = await readFile('./server/scripts/1_DDL.sql');
    await dbQuery(createSql);

    const insertSql = await readFile('./server/scripts/2_DML.sql');
    await dbQuery(insertSql);

    console.log('Server and Notes Application is listening to http://localhost:8080');
},);