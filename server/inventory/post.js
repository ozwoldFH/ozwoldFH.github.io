const dbQuery = require('../helper/db');

async function post({ name, weight, description, location, room, type, addedDateTime, addedBy, lastServiceDateTime, lastServiceBy, nextServiceDateTime }) {
    try {
        if (lastServiceDateTime === '') {
            lastServiceDateTime = null;
        }
        if (nextServiceDateTime === '') {
            nextServiceDateTime = null;
        }
        const sql = {
            text: `INSERT INTO T_INVENTORY (item_name,weight,description,location,room,item_type,added_datetime,added_by,last_service_datetime,last_service_by,next_service_datetime)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            values: [name, weight, description, location, room, type, addedDateTime, addedBy, lastServiceDateTime, lastServiceBy, nextServiceDateTime]
        }

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

module.exports = post;