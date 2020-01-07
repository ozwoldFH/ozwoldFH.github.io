const http = require('http');
const url = require('url');
require('dotenv').config();
const sendStaticFiles = require('./server/helper/sendStaticFiles');
const startsWith = require('./server/helper/startsWith');
const getRequestData = require('./server/helper/getRequestData');
const getInventory = require('./server/inventory/get');
const postInventory = require('./server/inventory/post');
const putInventory = require('./server/inventory/put');
const deleteInventory = require('./server/inventory/delete');

async function handleRequest(request, response) {
    const requestUrl = url.parse(request.url, true);

    if (requestUrl.pathname === '' || requestUrl.pathname === '/' ||
        requestUrl.pathname === '/index' || requestUrl.pathname === '/index.html') {
        return await sendStaticFiles('./client/index.html', response);
    }
    if (requestUrl.pathname === '/form' || requestUrl.pathname === '/form.html') {
        return await sendStaticFiles('./client/form.html', response);
    }
    if (requestUrl.pathname.includes('.')) {
        return await sendStaticFiles('./client' + requestUrl.pathname, response);
    }
    if (requestUrl.pathname === '/inventory' && request.method === 'GET') {
        const data = await getInventory();
        return {
            code: 200,
            headers: {'content-type': 'application/json; charset=utf-8'},
            body: JSON.stringify(data),
        };
    }
    if (startsWith(requestUrl.pathname, '/inventory') && request.method === 'PUT') {
        const dataJSON = await getRequestData(request);
        const result = await putInventory(dataJSON);
        return {
            code: 200,
            headers: {'content-type': 'application/json; charset=utf-8'},
            body: JSON.stringify(result),
        };
    }
    if (requestUrl.pathname === '/inventory' && request.method === 'POST') {
        const dataJSON = await getRequestData(request);
        const result = await postInventory(dataJSON);
        return {
            code: 200,
            headers: {'content-type': 'application/json; charset=utf-8'},
            body: JSON.stringify(result),
        };
    }
    if (requestUrl.pathname === '/inventory' && request.method === 'DELETE') {
        const dataJSON = await getRequestData(request);
        const result = await deleteInventory(dataJSON);
        return {
            code: 200,
            headers: {'content-type': 'application/json; charset=utf-8'},
            body: JSON.stringify(result),
        };
    }

    throw {
        code: 404,
        message: 'Endpoint not found',
    };
}

const server = http.createServer(async (request, response) => {
    try {
        const result = await handleRequest(request, response);
        if (result) {
            response.writeHead(result.code, result.message, result.headers)
                .end(result.body, 'utf-8');
        }
    } catch (err) {
        const statusCode = err.code < 600 ? err.code : 500;
        const message = typeof err.message === 'string' ? err.message : 'Internal server error'
        response.writeHead(statusCode, message).end();
    }
});


const port = process.env.PORT || 80;
server.listen(port, () => {
    console.log('Server and Notes Application is listening to http://localhost:' + port);
},);