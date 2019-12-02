const mysql = require('mysql');

const con = mysql.createConnection({
    host: process.env.DATABASE_URL,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    multipleStatements: true,
});
let connectPromise;

function getConnection() {
    if (!connectPromise) {
        connectPromise = new Promise((resolve, reject) => {
            con.connect(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(con);
                }
            });
        });
    }

    return connectPromise;
}

async function query(sql) {
    const con = await getConnection();
    return new Promise((resolve, reject) => {
        con.query(sql, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = query;