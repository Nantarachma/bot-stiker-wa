const moment = require('moment');
const { commandSchedules } = require('./config');

class ReminderSystem {
    constructor() {
        this.reminderTime = 30; // default 30 minutes before schedule
    }

    // Mengkonversi jadwal ke format waktu yang dapat digunakan
    parseScheduleTime(scheduleString) {
        // Format waktu yang diharapkan: "HH.MM-HH.MM"
        const timeMatch = scheduleString.match(/(\d{2}\.\d{2})-(\d{2}\.\d{2})/);
        if (!timeMatch) return null;

        const startTime = timeMatch[1].replace('.', ':');
        return moment(startTime, 'HH:mm');
    }

    // Mendapatkan waktu kelas berikutnya
    getNextClassTime() {
        const now = moment();
        let nextClassTime = null;

        const days = Object.keys(commandSchedules);
        for (let i = 0; i < days.length; i++) {
            const dayIndex = (now.day() + i) % 7; // Get the day index considering the current day
            const day = days[dayIndex];
            const daySchedule = commandSchedules[day];
            if (!daySchedule) continue;

            const scheduleLines = daySchedule.split('\n');
            for (const scheduleLine of scheduleLines) {
                const startTime = this.parseScheduleTime(scheduleLine);
                if (!startTime) continue;

                const classTime = moment(`${day} ${startTime.format('HH:mm')}`, 'dddd HH:mm');
                if (classTime.isBefore(now)) {
                    classTime.add(1, 'week'); // Move to the next week if the class time is before now
                }

                if (!nextClassTime || classTime.isBefore(nextClassTime)) {
                    nextClassTime = classTime;
                }
            }
        }

        return nextClassTime;
    }

    // Mendapatkan waktu hingga kelas berikutnya
    getTimeUntilNextClass() {
        const nextClassTime = this.getNextClassTime();
        if (!nextClassTime) return null;

        const now = moment();
        const duration = moment.duration(nextClassTime.diff(now));
        const days = Math.floor(duration.asDays());
        const hours = duration.hours();
        const minutes = duration.minutes();
        return { days, hours, minutes };
    }
}

module.exports = ReminderSystem;