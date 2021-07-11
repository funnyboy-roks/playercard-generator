const { createCanvas, loadImage } = require('canvas');
const fetch = require('node-fetch');

/**
 *
 * @param {string} name
 */
const getTextureUrl = async (name) => {
	const uuidJson = await fetch.default(
		`https://api.mojang.com/users/profiles/minecraft/${name}`
	);
	const uuid = await uuidJson.json();
	const profileJson = await fetch.default(
		`https://sessionserver.mojang.com/session/minecraft/profile/${uuid.id}`
	);
	const profile = await profileJson.json();
	const { value } = profile.properties[0];
	const decoded = JSON.parse(Buffer.from(value, 'base64').toString('utf-8'));
	const skinUrl = decoded.textures.SKIN.url;

	return skinUrl.substring(skinUrl.lastIndexOf('/') + 1);
	// const decoded2 = Buffer.from('base64');
	// console.log('Decoded2', decoded2);
};

/**
 * @param {string} name
 * @param {Object} query
 * @returns {Buffer} img buffer
 */
module.exports = async (name, query) => {
	console.log(query);
	const textureUrl = await getTextureUrl(name);

	const img = await loadImage(
		`https://minecraft-heads.com/scripts/3d-head.php?hrh=00&aa=true&headOnly=false&ratio=6&imageUrl=${textureUrl}`
	);

	const bgImg = await loadImage(
		'https://cdn.minecraft-server-list.com/serverlogo/437077.jpg'
	);

	const width = 600;
	const height = img.height + 100;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, width, height);

	ctx.drawImage(bgImg, -50, 0, width * 4, height); // TODO: ctx.drawImage(bgImg, 0, 0, width, height); once I have the correct bg img

	ctx.font = 'bold 30pt Menlo';
	ctx.textBaseline = 'top';

	const textWidth = ctx.measureText(name).width;
	const textHeight = ctx.measureText(name).actualBoundingBoxDescent;
	const nameOverlap = 10;

	ctx.fillStyle = '#0008';
	ctx.fillRect(
		50 - nameOverlap,
		50 - nameOverlap,
		textWidth + nameOverlap * 2,
		textHeight + nameOverlap * 2
	);

	ctx.fillStyle = query.color;
	ctx.fillText(name, 50, 50, width);

	let vstart = 120;
	let hoffset = 0;
	let h = 0;

	Object.entries(query.stats).forEach(([k, v] /* , i */) => {
		ctx.font = 'bold 12pt Menlo';
		ctx.fillStyle = '#fff';
		ctx.fillText(k, 50 + hoffset, h * 50 + vstart);

		ctx.font = '11pt Menlo';
		ctx.fillStyle = '#eee';
		ctx.fillText(v, 60 + hoffset, h * 50 + vstart + 20);

		++h;
		if (h * 40 + 170 >= height - 20) {
			h = 0;
			hoffset += 200;
		}
	});

	ctx.drawImage(img, width - img.width - 50, 50);

	return canvas.toBuffer('image/png');
};
