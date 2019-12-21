const dbQuery = require('../helper/db');

async function post(newItems) {
    try {
        let valueIndex = 1;
        const sqlValues = newItems.map(newItem => '(' + Array(11).fill(0).map(v => `$${valueIndex++}`).join(',') + ')').join(',');
        const sql = {
            text: 'INSERT INTO T_INVENTORY (item_name,weight,description,location,room,item_type,added_datetime,added_by,last_service_datetime,last_service_by,next_service_datetime)' +
                ' VALUES ' + sqlValues,
            values: [],
        };

        const now = new Date();
        newItems.forEach(newItem => {
            if (!newItem.name || !newItem.weight || !newItem.description || !newItem.location
                || !newItem.room || !newItem.type || !newItem.addedDateTime || !newItem.addedBy) {
                throw {code: 400, message: 'data is invalid'};
            }

            if (!newItem.lastServiceDateTime) {
                newItem.lastServiceDateTime = null;
            } else if (!(now > new Date(newItem.lastServiceDateTime))) {
                throw {code: 400, message: 'lastServiceDateTime has to be in the past'};
            }
            if (!newItem.nextServiceDateTime) {
                newItem.nextServiceDateTime = null;
            } else if (!(now < new Date(newItem.nextServiceDateTime))) {
                throw {code: 400, message: 'nextServiceDate has to be in the future'};
            }

            sql.values.push(newItem.name);
            sql.values.push(newItem.weight);
            sql.values.push(newItem.description);
            sql.values.push(newItem.location);
            sql.values.push(newItem.room);
            sql.values.push(newItem.type);
            sql.values.push(newItem.addedDateTime);
            sql.values.push(newItem.addedBy);
            sql.values.push(newItem.lastServiceDateTime);
            sql.values.push(newItem.lastServiceBy);
            sql.values.push(newItem.nextServiceDateTime);
        });

        const result = await dbQuery(sql);
        return result;
    } catch (err) {
        throw {
            code: Number(err.code) || 500,
            message: err.message,
        }
    }
}

module.exports = post;