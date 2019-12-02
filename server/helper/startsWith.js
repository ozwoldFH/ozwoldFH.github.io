function startsWith(text, key) {
    if (text.length < key.length) {
        return false;
    }

    return text.substring(0, key.length) === key;
}

module.exports = startsWith;