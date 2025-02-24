const fs = require('fs-extra');
const moment = require('moment');

const logMessage = (msg) => {
    const time = moment().format('YYYY-MM-DD HH:mm:ss');
    const logEntry = `[${time}] From: ${msg.from}, Message: ${msg.body}\n`;
    fs.appendFileSync('message-logs.txt', logEntry);
};

module.exports = { logMessage };