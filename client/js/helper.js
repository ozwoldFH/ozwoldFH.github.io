function request(url, method, body, contentType = "application/json;charset=UTF-8") {
    return new Promise(((resolve, reject) => {
        const ajaxObject = new XMLHttpRequest();

        ajaxObject.onreadystatechange = () => {
            if (ajaxObject.readyState === 4) {
                if (ajaxObject.status === 200) {
                    resolve(JSON.parse(ajaxObject.responseText));
                } else {
                    reject({
                        status: ajaxObject.status,
                        message: ajaxObject.statusText,
                        body: ajaxObject.responseText,
                    });
                }
            }
        };

        ajaxObject.open(method, url, true);
        if (body) {
            ajaxObject.setRequestHeader("Content-Type", contentType);
            ajaxObject.send(JSON.stringify(body));
        } else {
            ajaxObject.send();
        }
    }));
}