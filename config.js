const { LocalAuth } = require('whatsapp-web.js');

const schedules = {
    'Senin': `👉Senin 09.30-12.00 - E-Business\n👩Dosen = Bu Amalia\n🏫Ruang = GKB 1 R4.6\n\n👉Senin 13.00-15.30 - Statistika Komputasi  \n👩Dosen = Bu Eka and Bu Virda\n🏫Ruang = Gedung 1 R302\n\n👉Senin 15.30-18.00 - KECAP  \n👨Dosen = Pak Dhian\n🏫Ruang = Gedung 1 R302`,
    'Selasa': `👉Selasa 07.00-08.40 - Bahasa Indonesia \n👨Dosen = Pak Dwika\n🏫Ruang = GKB 1 R2.2\n\n👉Selasa 13.00-15.30 - MPSI \n👩Dosen = Bu Anita\n🏫Ruang = Gedung 1 R301`,
    'Rabu': `👉Rabu 13.00-15.30 - Pemrograman Mobile \n👨Dosen = Pak Efrat\n🏫Ruang = Gedung 1 R302\n\n👉Rabu 15.30-18.00 - PKTI \n👨Dosen = Pak Lathif\n🏫Ruang = Lab Solusi`,
    'Kamis': `👉Kamis 09.30-12.00 - Pemrograman Web\n👩👨Dosen = Bu Eka and Pak Nambi\n🏫Ruang = Gedung 2 R304`
};

const clientConfig = {
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    },
    qrMaxRetries: 3,
    restartOnAuthFail: true
};

module.exports = {
    schedules,
    clientConfig
};