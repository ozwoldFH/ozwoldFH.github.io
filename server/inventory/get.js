const dbQuery = require('../helper/db');

async function get() {
    const sql = 'SELECT *, TO_CHAR(added_datetime, \'DD.MM.YYYY\') as added_DateTime, TO_CHAR(last_service_datetime, \'DD.MM.YYYY\') as last_service_datetime, TO_CHAR(next_service_datetime, \'DD.MM.YYYY\') as next_service_datetime FROM T_INVENTORY ORDER BY id';
    const result = await dbQuery(sql);

    return result.map(item => {
        return {
            id: item.id,
            name: item.item_name || '',
            weightKg: item.weight || 0,
            description: item.description || '',
            location: item.location || '',
            room: item.room || '',
            type: item.item_type || '',
            addedDateTime: item.added_datetime || '',
            addedBy: item.added_by || '',
            lastServiceDateTime: item.last_service_datetime || '',
            lastServiceBy: item.last_service_by || '',
            nextServiceDateTime: item.next_service_datetime || '',
        };
    });
}

module.exports = get;