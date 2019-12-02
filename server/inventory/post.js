function post({name, weight, description, location, room, type, addedDateTime, addedBy, lastServiceDateTime, lastServiceBy, nextServiceDateTime}) {
    try {
        /// TODO: add logic
    } catch (err) {
        return {
            code: 500,
            message: err.message,
        }
    }

    return {};
}

module.exports = post;