const moment = require('moment');
const { schedules } = require('./config');

const getCurrentTime = () => {
    return moment().format('HH:mm:ss');
};

const getToday = () => {
    return moment().locale('id').format('dddd');
};

const getTodaySchedule = () => {
    const today = getToday();
    return schedules[today] || 'Tidak ada jadwal hari ini';
};

const getDaySchedule = (day) => {
    return schedules[day] || 'Tidak ada jadwal untuk hari tersebut';
};

module.exports = {
    getCurrentTime,
    getToday,
    getTodaySchedule,
    getDaySchedule
};