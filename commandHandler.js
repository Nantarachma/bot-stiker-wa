const ReminderSystem = require('./reminderSystem');
const TaskManager = require('./taskManager');
const { createSticker, createStickerFromText } = require('./stickerHandler');
const moment = require('moment');
const { MessageMedia } = require('whatsapp-web.js');

// Inisialisasi sistem
const reminderSystem = new ReminderSystem();
const taskManager = new TaskManager();
const { getCurrentTime, getToday, getTodaySchedule, getDaySchedule } = require('./utils');
const { schedules } = require('./config');

async function handleCommand(msg, command) {
    try {
        switch(command) {
            case '!bot':
                return await msg.reply(`👋 Hello! BOT AKTIF\nWaktu: ${getCurrentTime()}`);

            case '!cmd':
            case '!help':
            case '!menu':
                return await msg.reply
(`📋 DAFTAR PERINTAH BOT:
!bot = Cek bot aktif
!jadwal = Lihat semua jadwal kuliah
!jadwalhari = Lihat jadwal hari ini
!stiker = Buat stiker dari gambar
!rules = Lihat peraturan bot
!about = Info tentang bot
!time = Lihat waktu sekarang`);

            case '!jadwal':
                const allSchedules = Object.entries(schedules)
                    .map(([day, schedule]) => `=== ${day} ===\n${schedule}`)
                    .join('\n\n');
                return await msg.reply(`✨--JADWAL MATKUL--✨\n\n${allSchedules}`);

            case '!jadwalhari':
                return await msg.reply(`📅 Jadwal Hari ${getToday()}:\n${getTodaySchedule()}`);

            case '!jadwalharisenin':
                return await msg.reply(`📅 Jadwal Hari Senin:\n${getDaySchedule('Senin')}`);

            case '!jadwalhariselasa':
                return await msg.reply(`📅 Jadwal Hari Selasa:\n${getDaySchedule('Selasa')}`);

            case '!jadwalharirabu':
                return await msg.reply(`📅 Jadwal Hari Rabu:\n${getDaySchedule('Rabu')}`);

            case '!jadwalharikamis':
                return await msg.reply(`📅 Jadwal Hari Kamis:\n${getDaySchedule('Kamis')}`);

            case '!jadwalharijumat':
                return await msg.reply(`📅 Jadwal Hari Jum'at:\n${getDaySchedule('Jumat')}`);

            case '!jadwalharisabtu':
                return await msg.reply(`📅 Jadwal Hari Sabtu:\n${getDaySchedule('Sabtu')}`);

            case '!jadwalhariminggu':
                return await msg.reply(`📅 Jadwal Hari Minggu:\n${getDaySchedule('Minggu')}`);

            case '!stiker':
            case '!sticker':
                if (msg.hasMedia) {
                    return await createSticker(msg);
                } else if (msg.body.split(' ').length > 1) {
                    const text = msg.body.split(' ').slice(1).join(' ');
                    return await createStickerFromText(msg, text);
                } else {
                    return await msg.reply('❌ Silakan kirim gambar dengan caption !stiker atau teks dengan format !stiker <teks>');
                }
                break;

            // case '!reminder on':
            //     reminderSystem.addSubscriber(msg.from);
            //     await msg.reply('✅ Anda telah berlangganan pengingat jadwal!');
            //     break;
            //
            // case '!reminder off':
            //     reminderSystem.removeSubscriber(msg.from);
            //     await msg.reply('❌ Anda telah berhenti berlangganan pengingat jadwal!');
            //     break;
            //
            // case '!setreminder':
            //     const minutes = msg.body.split(' ')[1];
            //     if (!minutes || isNaN(minutes)) {
            //         await msg.reply('❌ Format salah! Gunakan: !setreminder <menit>');
            //         break;
            //     }
            //     reminderSystem.setReminderTime(parseInt(minutes));
            //     await msg.reply(`✅ Waktu pengingat diatur ke ${minutes} menit sebelum jadwal`);
            //     break;
            //
            // case '!addingtask':
            //     console.log('Received !addtask command');
            //     if (taskParts.length < 4) {
            //         await msg.reply(
            //             '❌ Format salah! Gunakan:\n!addtask\n<mata kuliah>\n<deskripsi>\n<deadline (DD/MM/YYYY atau DD/MM/YYYY HH:mm)>'
            //         );
            //         break;
            //     }
            //
            //     const [, subject, description, deadline] = taskParts;
            //     console.log('Task Parts:', { subject, description, deadline });
            //
            //     let deadlineMoment;
            //     if (moment(deadline.trim(), 'DD/MM/YYYY', true).isValid()) {
            //         // Jika formatnya hanya tanggal, tambahkan jam default
            //         deadlineMoment = moment(deadline.trim() + ' 23:59', 'DD/MM/YYYY HH:mm');
            //     } else {
            //         // Jika formatnya tanggal dan jam
            //         deadlineMoment = moment(deadline.trim(), 'DD/MM/YYYY HH:mm');
            //     }
            //
            //     if (!deadlineMoment.isValid()) {
            //         await msg.reply('❌ Format deadline salah! Gunakan: DD/MM/YYYY atau DD/MM/YYYY HH:mm');
            //         break;
            //     }
            //
            //     try {
            //         const taskId = taskManager.addTask(
            //             subject.trim(),
            //             description.trim(),
            //             deadlineMoment,
            //             msg.author || msg.from
            //         );
            //         console.log('Task ID:', taskId);
            //         await msg.reply(`✅ Tugas berhasil ditambahkan dengan ID: ${taskId}`);
            //     } catch (error) {
            //         console.error('Error adding task:', error);
            //         await msg.reply('❌ Terjadi kesalahan saat menambahkan tugas.');
            //     }
            //     break;
            //
            // case '!tasks':
            //     const pendingTasks = taskManager.getPendingTasks();
            //     if (pendingTasks.length === 0) {
            //         await msg.reply('📝 Tidak ada tugas yang pending!');
            //         break;
            //     }
            //
            //     const taskList = pendingTasks
            //         .map(task => taskManager.formatTaskMessage(task))
            //         .join('\n\n');
            //
            //     await msg.reply(`📋 DAFTAR TUGAS PENDING:\n\n${taskList}`);
            //     break;
            //
            // case '!overdue':
            //     const overdueTasks = taskManager.getOverdueTasks();
            //     if (overdueTasks.length === 0) {
            //         await msg.reply('✅ Tidak ada tugas yang melewati deadline!');
            //         break;
            //     }
            //
            //     const overdueList = overdueTasks
            //         .map(task => taskManager.formatTaskMessage(task))
            //         .join('\n\n');
            //
            //     await msg.reply(`⚠️ TUGAS MELEWATI DEADLINE:\n\n${overdueList}`);
            //     break;
            //
            // case '!submit':
            //     const submitParts = msg.body.split(' ');
            //     if (submitParts.length < 3) {
            //         await msg.reply('❌ Format salah! Gunakan: !submit <taskId> <link_submission>');
            //         break;
            //     }
            //
            //     const [, submitTaskId, submissionLink] = submitParts;
            //     const success = taskManager.addSubmission(submitTaskId, msg.from, submissionLink);
            //
            //     if (success) {
            //         await msg.reply('✅ Submission berhasil dicatat!');
            //     } else {
            //         await msg.reply('❌ Task ID tidak ditemukan!');
            //     }
            //     break;

            default:
                return null;
        }
    } catch (error) {
        console.error('Error in command handler:', error);
        throw error;
    }
}

module.exports = { handleCommand };