const dbQuery = require('../helper/db');

async function put({id, name, weight, description, location, room, type, addedDateTime, addedBy, lastServiceDateTime, lastServiceBy, nextServiceDateTime}) {
    try {
        if (!name || !weight || !description || !location
            || !room || !type || !addedDateTime || !addedBy) {
            throw {code: 400, message: 'data is invalid'};
        }

        const now = new Date();
        if (!lastServiceDateTime) {
            lastServiceDateTime = null;
        } else if (!(now > new Date(lastServiceDateTime))) {
            throw {code: 400, message: 'lastServiceDateTime has to be in the past'};
        }
        if (!nextServiceDateTime) {
            nextServiceDateTime = null;
        } else if (!(now < new Date(nextServiceDateTime))) {
            throw {code: 400, message: 'nextServiceDate has to be in the future'};
        }

        const sql = {
            text: `UPDATE T_INVENTORY SET (item_name, weight,description,location,room,item_type,added_datetime,added_by,last_service_datetime,last_service_by,next_service_datetime) = ($2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            WHERE id = $1;`,
            values: [id, name, weight, description, location, room, type, addedDateTime, addedBy, lastServiceDateTime, lastServiceBy, nextServiceDateTime]
        };

        const result = await dbQuery(sql);
        return result;

    } catch (err) {
        throw {
            code: Number(err.code) || 500,
            message: err.message,
        }
    }
}

module.exports = put;