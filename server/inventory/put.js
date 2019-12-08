const dbQuery = require('../helper/db');

async function put({id, name, weight, description, location, room, type, addedDateTime, addedBy, lastServiceDateTime, lastServiceBy, nextServiceDateTime}) {
    try {
        if (lastServiceDateTime === '') {
            lastServiceDateTime = null;
        }
        if (nextServiceDateTime === '') {
            nextServiceDateTime = null;
        }
        const sql = {
            text: `UPDATE T_INVENTORY SET (item_name, weight,description,location,room,item_type,added_datetime,added_by,last_service_datetime,last_service_by,next_service_datetime) = ($2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            WHERE id = $1;`,
            values: [id, name, weight, description, location, room, type, addedDateTime, addedBy, lastServiceDateTime, lastServiceBy, nextServiceDateTime]
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

module.exports = put;