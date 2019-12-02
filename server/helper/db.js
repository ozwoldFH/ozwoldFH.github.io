const {Client} = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});
let connectPromise;

async function getClient() {
    if (!connectPromise) {
        connectPromise = client.connect();
    }

    await connectPromise;
    return client;
}

async function query(sql) {
    const client = await getClient();
    return new Promise((resolve, reject) => {
        client.query(sql, (err, res) => {
            if (err) {
                reject(err);
            } else {
                const rows = [];
                res.rows.forEach(row => rows.push(row));
                resolve(rows);
            }
        });
    });
}

module.exports = query;