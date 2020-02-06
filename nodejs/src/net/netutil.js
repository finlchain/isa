module.exports.isJsonString = (str) =>{
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports.writeData = (socket, data) =>{
    let success = socket.write(data);
    if (!success) {
        writeData(socket, data);
    }
}