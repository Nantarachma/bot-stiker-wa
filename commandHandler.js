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
        const [mainCommand, ...args] = command.split(' ');

        switch(mainCommand) {
            case '!bot':
                return await msg.reply(`👋 Hello! BOT AKTIF\nWaktu: ${getCurrentTime()}`);

            case '!cmd':
            case '!help':
            case '!menu':
                const commands = [
                    '!bot = Cek bot aktif',
                    '!jadwal = Lihat semua jadwal kuliah',
                    '!jadwalhari = Lihat jadwal hari ini',
                    '!jadwalhari<bebas> = Lihat jadwal hari tertentu',
                    '!stiker = Buat stiker dari gambar atau teks'
                ].join('\n');
                return await msg.reply(`📋 DAFTAR PERINTAH BOT:\n${commands}`);

            case '!jadwal':
                const allSchedules = Object.entries(schedules)
                    .map(([day, schedule]) => `=== ${day} ===\n${schedule}`)
                    .join('\n\n');
                return await msg.reply(`✨--JADWAL MATKUL--✨\n\n${allSchedules}`);

            case '!kelaskapan':
                const timeUntilNextClass = reminderSystem.getTimeUntilNextClass();
                if (timeUntilNextClass === null) {
                    return await msg.reply('Tidak ada kelas berikutnya yang terjadwal.');
                } else {
                    const { days, hours, minutes } = timeUntilNextClass;
                    let replyMessage = 'Kelas berikutnya akan dimulai dalam ';
                    if (days > 0) {
                        replyMessage += `${days} hari `;
                    }
                    if (hours > 0) {
                        replyMessage += `${hours} jam `;
                    }
                    replyMessage += `${minutes} menit.`;
                    return await msg.reply(replyMessage);
                }

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
                } else if (args.length > 0) {
                    const text = args.join(' ');
                    return await createStickerFromText(msg, text);
                } else {
                    return await msg.reply('❌ Silakan kirim gambar dengan caption !stiker atau teks dengan format !stiker <teks>');
                }
                break;

            case '!reminder':
                if (args[0] === 'on') {
                    if (reminderSystem.isSubscriber(msg.from)) {
                        await msg.reply('⚠️ Anda sudah berlangganan pengingat jadwal!');
                    } else {
                        reminderSystem.addSubscriber(msg.from);
                        await msg.reply('✅ Anda telah berlangganan pengingat jadwal!');
                    }
                } else if (args[0] === 'off') {
                    if (reminderSystem.isSubscriber(msg.from)) {
                        reminderSystem.removeSubscriber(msg.from);
                        await msg.reply('❌ Anda telah berhenti berlangganan pengingat jadwal!');
                    } else {
                        await msg.reply('⚠️ Anda belum berlangganan pengingat jadwal!');
                    }
                } else {
                    await msg.reply('❌ Format salah! Gunakan: !reminder on/off');
                }
                break;

            case '!setreminder':
                if (!reminderSystem.isSubscriber(msg.from)) {
                    await msg.reply('⚠️ Anda belum berlangganan pengingat jadwal! Gunakan: !reminder on untuk berlangganan.');
                    break;
                }

                const minutes = args[0];
                if (!minutes || isNaN(minutes)) {
                    await msg.reply('❌ Format salah! Gunakan: !setreminder <menit>');
                    break;
                }
                reminderSystem.setReminderTime(parseInt(minutes));
                await msg.reply(`✅ Waktu pengingat diatur ke ${minutes} menit sebelum jadwal`);
                break;

            // case '!addtask':
            //     const taskParts = msg.body.split('\n');
            //     if (taskParts.length < 4) {
            //         await msg.reply(
            //             '❌ Format salah! Gunakan:\n!addtask\n<mata kuliah>\n<deskripsi>\n<deadline (DD/MM/YYYY atau DD/MM/YYYY HH:mm)>'
            //         );
            //         break;
            //     }
            //
            //     const [, subject, description, deadline] = taskParts;
            //
            //     let deadlineMoment;
            //     if (moment(deadline.trim(), 'DD/MM/YYYY', true).isValid()) {
            //         deadlineMoment = moment(deadline.trim() + ' 23:59', 'DD/MM/YYYY HH:mm');
            //     } else {
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
            //     const [submitTaskId, submissionLink] = args;
            //     if (!submitTaskId || !submissionLink) {
            //         await msg.reply('❌ Format salah! Gunakan: !submit <taskId> <link_submission>');
            //         break;
            //     }
            //
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