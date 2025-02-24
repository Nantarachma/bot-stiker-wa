const schedule = require('node-schedule');
const moment = require('moment');

class ReminderSystem {
    constructor() {
        this.activeReminders = new Map();
        this.subscribers = new Set();
        this.reminderTime = 30; // default 30 menit sebelum jadwal
    }

    // Mengkonversi jadwal ke format waktu yang dapat digunakan
    parseScheduleTime(scheduleString) {
        // Format waktu yang diharapkan: "HH.MM-HH.MM"
        const timeMatch = scheduleString.match(/(\d{2}.\d{2})-(\d{2}.\d{2})/);
        if (!timeMatch) return null;

        const startTime = timeMatch[1].replace('.', ':');
        return moment(startTime, 'HH:mm');
    }

    // Mengatur reminder untuk satu hari
    setupDailyReminders(day, schedules) {
        const daySchedule = schedules[day];
        if (!daySchedule) return;

        const scheduleLines = daySchedule.split('\n\n');
        scheduleLines.forEach(scheduleLine => {
            const timeMatch = scheduleLine.match(/(\d{2}.\d{2})-(\d{2}.\d{2})/);
            if (!timeMatch) return;

            const startTime = this.parseScheduleTime(scheduleLine);
            if (!startTime) return;

            const reminderTime = moment(startTime).subtract(this.reminderTime, 'minutes');
            const cronTime = `${reminderTime.minutes()} ${reminderTime.hours()} * * ${this.getDayNumber(day)}`;

            const job = schedule.scheduleJob(cronTime, () => {
                this.sendReminder(scheduleLine);
            });

            this.activeReminders.set(`${day}-${timeMatch[0]}`, job);
        });
    }

    // Konversi nama hari ke angka untuk cron
    getDayNumber(day) {
        const days = {
            'Minggu': 0, 'Senin': 1, 'Selasa': 2, 'Rabu': 3,
            'Kamis': 4, 'Jumat': 5, 'Sabtu': 6
        };
        return days[day];
    }

    // Mengirim reminder ke semua subscriber
    async sendReminder(scheduleInfo) {
        const message = `🔔 PENGINGAT JADWAL!\n\n${scheduleInfo}\n\n⏰ Kelas akan dimulai dalam ${this.reminderTime} menit!`;

        for (const subscriber of this.subscribers) {
            try {
                await client.sendMessage(subscriber, message);
            } catch (error) {
                console.error(`Failed to send reminder to ${subscriber}:`, error);
            }
        }
    }

    // Menambah subscriber
    addSubscriber(userId) {
        this.subscribers.add(userId);
        return this.subscribers.size;
    }

    // Menghapus subscriber
    removeSubscriber(userId) {
        this.subscribers.delete(userId);
        return this.subscribers.size;
    }

    // Mengatur waktu reminder (dalam menit)
    setReminderTime(minutes) {
        this.reminderTime = minutes;
        // Perlu mengatur ulang semua reminder
        this.resetAllReminders();
    }

    // Mengatur ulang semua reminder
    resetAllReminders() {
        // Batalkan semua job yang aktif
        for (const [, job] of this.activeReminders) {
            job.cancel();
        }
        this.activeReminders.clear();

        // Setup ulang untuk setiap hari
        Object.keys(schedules).forEach(day => {
            this.setupDailyReminders(day, schedules);
        });
    }
}

module.exports = ReminderSystem;