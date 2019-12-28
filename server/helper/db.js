const {Client} = require('pg');

async function getClient() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });
    await client.connect();
    return client;
}

async function query(sql) {
    const client = await getClient();
    const res = await client.query(sql);
    await client.end();
    if (res.rows.length) {
        return [...res.rows];
    } else {
        return res.rowCount;
    }
}

module.exports = query;