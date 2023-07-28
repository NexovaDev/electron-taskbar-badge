'use strict';
module.exports = class BadgeGenerator {
	constructor(win, opts = {}, systemAccentTheme) {
		const defaultStyle = {
			decimals: 0,
			systemAccentTheme,
		};
		this.win = win;
		this.style = Object.assign(defaultStyle, opts);
	}

	generate(number, updateColor) {
		if (!number) return;
		let opts = JSON.stringify(this.style);
		if (updateColor) {
			opts = JSON.stringify(this.style);
		}
		return this.win.webContents.executeJavaScript(`window.drawBadge = function ${this.drawBadge}; window.drawBadge(${number}, ${opts});`);
	}

	drawBadge(number, style) {
		if (typeof style?.color !== 'string') {
			throw new TypeError(`Invalid color specified\nExpected: string\nGot: ${typeof style?.color}`);
		}
		if (/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/gm.test(style?.fontColor)) {
			style.fontColor = rgbToHex.apply(null, [...[...style.fontColor.matchAll(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/gm)].flat().slice(1, -1)]);
		}
		if (/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/gm.test(style?.color)) {
			style.color = rgbToHex.apply(null, [...[...style.color.matchAll(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/gm)].flat().slice(1, -1)]);
		}
		if (!/^#[0-9A-F]{6}$/i.test(style?.fontColor)) {
			style.fontColor = 'auto';
		}
		style.font = style?.font ?? '62px Microsoft Yahei';
		style.fontColor = style?.fontColor ?? 'auto';
		style.radius = style?.radius ?? 48;
		style.fit = style?.fit ?? false;
		style.useSystemAccentTheme = style?.useSystemAccentTheme ?? false;
		style.decimals = style?.decimals === undefined || isNaN(style.decimals) ? 0 : style.decimals;
		style.max = style?.max ?? 99;

		const radius = style.radius;
		const img = document.createElement('canvas');
		img.width = Math.ceil(radius * 2);
		img.height = Math.ceil(radius * 2);
		img.ctx = img.getContext('2d');
		img.radius = radius;
		img.number = number;

		const accentColor = style.systemAccentTheme;

		if (style?.useSystemAccentTheme) {
			style.color = accentColor;
			style.fontColor = getTextColor(accentColor);
		}

		if (style.fontColor === 'auto') {
			style.fontColor = getTextColor(accentColor);
		}

		img.displayStyle = style;

		img.draw = function() {
			let fontScale, fontWidth, fontSize, integer;
			this.width = Math.ceil(this.radius * 2);
			this.height = Math.ceil(this.radius * 2);
			this.ctx.clearRect(0, 0, this.width, this.height);
			this.ctx.fillStyle = this.displayStyle.color;
			this.ctx.beginPath();
			this.ctx.arc(radius, radius, radius, 0, Math.PI * 2);
			this.ctx.fill();
			this.ctx.font = this.displayStyle.font;
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'middle';
			this.ctx.fillStyle = this.displayStyle.fontColor;
			integer = this.number.toFixed(this.displayStyle.decimals);

			fontSize = Number(/[0-9.]+/.exec(this.ctx.font)[0]);

			if (integer > style.max) {
				if (this.displayStyle.fit) {
					fontSize = fontSize * 1.175;
					integer = `${style.max}+`;
				} else {
					this.ctx.font = this.ctx.font.replace(/\d+/, Number(this.ctx.font.match(/\d+/)[0]) / 1.175);
					integer = `${style.max}+`;
				}
			}

			if (!this.displayStyle.fit || isNaN(fontSize)) {
				this.ctx.fillText(integer, radius, radius);
			} else {
				fontWidth = this.ctx.measureText(integer).width;
				fontScale = (Math.cos(Math.atan(fontSize / fontWidth)) * this.radius * 2 / fontWidth);
				this.ctx.setTransform(fontScale, 0, 0, fontScale, this.radius, this.radius);
				this.ctx.fillText(integer, 0, 0);
				this.ctx.setTransform(1, 0, 0, 1, 0, 0);
			}

			return this;
		};

		function getTextColor(bgColor) {
			// Convert hex color to RGB values
			const red = parseInt(bgColor.substr(1, 2), 16);
			const green = parseInt(bgColor.substr(3, 2), 16);
			const blue = parseInt(bgColor.substr(5, 2), 16);

			// Calculate perceived brightness using the luminosity algorithm
			const brightness = (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);

			// Return white or black based on the perceived brightness
			return (brightness > 128) ? '#000000' : '#FFFFFF';
		}

		function rgbToHex(r, g, b) {
			const red = parseInt(r);
			const green = parseInt(g);
			const blue = parseInt(b);

			const rgb = blue | (green << 8) | (red << 16);
			return '#' + rgb.toString(16);
		}

		img.draw();
		return img.toDataURL();
	}
};