const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const moment = require('moment');
const { clientConfig } = require('./config');
const { handleCommand } = require('./commandHandler');
const { stickerHandler } = require('./stickerHandler');
const { reminderSystem } = require('./reminderSystem');
const { taskManager } = require('./taskManager');
const { logMessage } = require('./messageLogger');

// Inisialisasi client
const client = new Client(clientConfig);
let isAuthenticated = false;

// Event handlers
client.on('qr', (qr) => {
    if (!isAuthenticated) {
        console.clear();
        console.log('Scan QR code berikut untuk login:');
        qrcode.generate(qr, { small: true });
    }
});

client.on('authenticated', () => {
    isAuthenticated = true;
    console.log('WhatsApp authenticated!');
});

client.on('auth_failure', (err) => {
    console.error('Authentication failed:', err);
    isAuthenticated = false;
});

client.on('ready', () => {
    console.log('===============================');
    console.log('✅ Bot siap digunakan!');
    console.log(`📅 Login time: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    console.log('===============================');
});

client.on('message', async (msg) => {
    try {
        logMessage(msg);
        const command = msg.body.toLowerCase();
        await handleCommand(msg, command);
    } catch (error) {
        console.error('Error:', error);
        await msg.reply('❌ Maaf, terjadi kesalahan. Silakan coba lagi nanti.');
    }
});

client.on('disconnected', async (reason) => {
    console.log('Client was logged out:', reason);
    isAuthenticated = false;

    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
        console.log('Mencoba menghubungkan kembali...');
        await client.initialize();
    } catch (error) {
        console.error('Gagal menghubungkan kembali:', error);
    }
});

// Start client
try {
    client.initialize();
} catch (error) {
    console.error('Error saat inisialisasi client:', error);
}