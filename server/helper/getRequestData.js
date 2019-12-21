function get(request) {
    return new Promise((resolve, reject) => {
        let data = '';
        request.on('data', function (chunk) {
            data += chunk;
        });

        request.on('end', function () {
            resolve(JSON.parse(data));
        });
    });
}

module.exports = get;