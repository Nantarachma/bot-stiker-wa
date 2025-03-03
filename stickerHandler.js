const { createCanvas, registerFont } = require('canvas');
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
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			})
			.toFile(processedPath);

		const stickerMedia = MessageMedia.fromFilePath(processedPath);
		await msg.reply(stickerMedia, undefined, {
			sendMediaAsSticker: true,
			stickerAuthor: 'Bot Nantara',
			stickerName: 'Stiker Gambar',
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

async function createStickerFromText(msg, text, options = {}) {
	// Register font
	const fontPath = path.join(__dirname, 'font', 'arialnarrow.ttf');
	registerFont(fontPath, {
		family: 'Arial Narrow Condensed',
		weight: 'normal',
		style: 'normal',
	});

	// Send processing message
	await msg.reply('⌛ Sedang memproses stiker...');

	const {
		outputDir = './output',
		backgroundColor = 'white',
		textColor = '#0D1111',
		initialFontSize = 90, // Changed from fontSize to initialFontSize
		maxWidth = 400,
		applyBlur = true,
		blurAmount = 2,
		minFontSize = 20, // Added minimum font size
	} = options;

	// Create canvas
	const canvas = createCanvas(512, 512);
	const ctx = canvas.getContext('2d');

	// Set background
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Find appropriate font size
	let fontSize = initialFontSize;
	let lines;
	const canvasHeight = canvas.height;
	const padding = 40; // Padding from top and bottom
	const maxHeight = canvasHeight - padding * 2;

	do {
		ctx.font = `${fontSize}px 'Arial Narrow Condensed', Arial`;
		lines = getLines(ctx, text, maxWidth);
		const totalTextHeight = lines.length * fontSize;

		if (totalTextHeight <= maxHeight || fontSize <= minFontSize) {
			break;
		}

		fontSize -= 5; // Decrease font size and try again
	} while (fontSize > minFontSize);

	// Set text properties with adaptive font size
	ctx.fillStyle = textColor;
	ctx.font = `${fontSize}px 'Arial Narrow Condensed', Arial`;
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';

	// Recalculate lines with final font size
	lines = getLines(ctx, text, maxWidth);
	const lineHeight = fontSize;

	// Center text vertically
	const textY = Math.max(0, (512 - lines.length * lineHeight) / 2);

	lines.forEach((line, index) => {
		const words = line.split(' ');
		const totalWordsWidth = words.reduce(
			(width, word) => width + ctx.measureText(word).width,
			0,
		);
		const spaceWidth = words.length > 1 ? (maxWidth - totalWordsWidth) / (words.length - 1) : 0;

		// Center horizontally
		const textX = (512 - maxWidth) / 2;

		let currentX = textX;
		words.forEach((word, wordIndex) => {
			ctx.fillText(word, currentX, textY + index * lineHeight);
			currentX +=
				ctx.measureText(word).width + (wordIndex < words.length - 1 ? spaceWidth : 0);
		});
	});

	// Convert canvas to buffer
	const buffer = canvas.toBuffer('image/png');

	// Apply effects and save
	const imageProcessor = sharp(buffer);

	if (applyBlur) {
		imageProcessor.blur(blurAmount);
	}

	const processedBuffer = await imageProcessor.toBuffer();

	// Save the image
	const fileName = `image-${moment().format('YYYYMMDDHHmmss')}.png`;
	const outputPath = path.join(outputDir, fileName);
	await fs.ensureDir(outputDir);
	await fs.writeFile(outputPath, processedBuffer);

	const stickerMedia = MessageMedia.fromFilePath(outputPath);
	await msg.reply(stickerMedia, undefined, {
		sendMediaAsSticker: true,
		stickerAuthor: 'Bot Nantara',
		stickerName: 'Stiker Anomali',
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

module.exports = { createStickerFromText, createSticker };
