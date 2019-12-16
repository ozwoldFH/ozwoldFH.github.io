const dbQuery = require('../helper/db');

async function deleteRow({id}) {
    try {
        const sql = {
            text: `DELETE FROM T_INVENTORY WHERE id = $1;`,
            values: [id]
        }

        console.log(sql);

        const result = await dbQuery(sql);
        return { result };

    } catch (err) {
        return {
            code: 500,
            message: err.message,
        }
    }

    return {};
}

module.exports = deleteRow;
