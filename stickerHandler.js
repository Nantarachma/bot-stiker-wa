const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

async function createSticker(msg) {
    try {
        await msg.reply('⌛ Sedang memproses stiker...');
        const media = await msg.downloadMedia();

        if (!media) {
            return false;
        }

        const tempPath = path.join(__dirname, 'temp', `sticker-${Date.now()}`);
        await fs.ensureDir(path.join(__dirname, 'temp'));
        await fs.writeFile(tempPath, media.data, 'base64');

        const processedPath = path.join(__dirname, 'temp', `processed-${Date.now()}.png`);
        await sharp(tempPath)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toFile(processedPath);

        const stickerMedia = MessageMedia.fromFilePath(processedPath);
        await msg.reply(stickerMedia, undefined, {
            sendMediaAsSticker: true,
            stickerAuthor: "Bot Nantara",
            stickerName: "Stiker Keren"
        });

        // Cleanup
        await fs.remove(tempPath);
        await fs.remove(processedPath);
        return true;
    } catch (error) {
        console.error('Error creating sticker:', error);
        return false;
    }
}

module.exports = { createSticker };