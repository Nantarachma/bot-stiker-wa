const { createCanvas } = require('canvas');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
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

async function createStickerFromText(msg, text) {
    await msg.reply('⌛ Sedang memproses stiker...');
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');

    // Set canvas background to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    ctx.fillStyle = 'black';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add text to canvas
    const lines = getLines(ctx, text, 400);
    const lineHeight = 50;
    const textX = canvas.width / 2;
    const textY = canvas.height / 2 - (lines.length - 1) * lineHeight / 2;

    lines.forEach((line, index) => {
        ctx.fillText(line, textX, textY + index * lineHeight);
    });

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    // Apply blur effect using sharp
    const stickerBuffer = await sharp(buffer)
        .blur(2) // Apply blur effect
        .toBuffer();

    // Save the sticker image
    const fileName = `sticker-${moment().format('YYYYMMDDHHmmss')}.png`;
    const outputPath = path.join(__dirname, 'stickers', fileName);
    await fs.ensureDir(path.join(__dirname, 'stickers'));
    await fs.writeFile(outputPath, stickerBuffer);

    const stickerMedia = MessageMedia.fromFilePath(outputPath);
    await msg.reply(stickerMedia, undefined, {
        sendMediaAsSticker: true,
        stickerAuthor: "Bot Nantara",
        stickerName: "Stiker Keren"
    });

    return outputPath;
}

const getLines = (ctx, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
};

module.exports = { createSticker, createStickerFromText };