import type { BrowserWindow } from 'electron';

interface DrawStyle {
	color: string;
	fontColor: string;
	font: string;
	radius: number;
	useSystemAccentTheme: boolean;
	decimals: number;
	max: number;
	systemAccentTheme: string;
}

type BadgeCanvas = HTMLCanvasElement & {
	ctx: CanvasRenderingContext2D;
	radius: number;
	badgeContent: number | string;
	displayStyle: DrawStyle;
	draw(): BadgeCanvas;
};

export default class BadgeGenerator {
	private win: BrowserWindow;
	private style: object;

	constructor(win: BrowserWindow, opts: object = {}, systemAccentTheme: string) {
		this.win = win;
		this.style = Object.assign({ decimals: 0, systemAccentTheme }, opts);
	}

	generate(badgeContent: number | string): Promise<string> {
		if (!badgeContent) return Promise.resolve('');
		const opts = JSON.stringify(this.style);
		return this.win.webContents.executeJavaScript(
			`window.drawBadge = function ${this.drawBadge}; window.drawBadge(${typeof badgeContent === 'number' ? badgeContent : `'${badgeContent}'`}, ${opts});`
		) as Promise<string>;
	}

	// Serialized and executed in the renderer via executeJavaScript — no Node.js APIs allowed here
	drawBadge(badgeContent: number | string, style: DrawStyle): string {
		if (typeof style?.color !== 'string') {
			throw new TypeError(`Invalid color specified\nExpected: string\nGot: ${typeof style?.color}`);
		}
		if (/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/gm.test(style?.fontColor)) {
			style.fontColor = (rgbToHex as (...args: string[]) => string).apply(null, [...[...style.fontColor.matchAll(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/gm)].flat().slice(1, -1)] as string[]);
		}
		if (/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/gm.test(style?.color)) {
			style.color = (rgbToHex as (...args: string[]) => string).apply(null, [...[...style.color.matchAll(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/gm)].flat().slice(1, -1)] as string[]);
		}
		if (!/^#[0-9A-F]{6}$/i.test(style?.fontColor)) {
			style.fontColor = 'auto';
		}
		style.font = '62px Microsoft Yahei';
		style.fontColor = style?.fontColor ?? 'auto';
		style.radius = 48;
		style.useSystemAccentTheme = style?.useSystemAccentTheme ?? false;
		style.decimals = style?.decimals === undefined || isNaN(style.decimals) ? 0 : style.decimals;
		style.max = style?.max ?? 9;

		const radius = style.radius;
		const img = document.createElement('canvas') as BadgeCanvas;
		img.width = Math.ceil(radius * 2);
		img.height = Math.ceil(radius * 2);
		img.ctx = img.getContext('2d') as CanvasRenderingContext2D;
		img.radius = radius;
		img.badgeContent = badgeContent;

		const accentColor = style.systemAccentTheme;

		if (style?.useSystemAccentTheme) {
			style.color = accentColor;
			style.fontColor = getTextColor(accentColor);
		}

		if (style.fontColor === 'auto') {
			style.fontColor = getTextColor(accentColor);
		}

		img.displayStyle = style;

		img.draw = function(this: BadgeCanvas): BadgeCanvas {
			const badgeTypes: Record<string, string> = {
				alert: '*',
				attention: '!',
				error: '×',
				available: '🟢',
				away: '🟡',
				busy: '🔴',
				unavailable: '🩶',
			};
			let fontScale: number, fontWidth: number;
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
			const badgeNumber = typeof badgeContent === 'number' ? badgeContent : null;
			badgeContent = typeof badgeContent === 'number' ? (this.badgeContent as number).toFixed(this.displayStyle.decimals) : badgeContent;

			const fontSize = Number(/[0-9.]+/.exec(this.ctx.font)![0]);

			if (typeof badgeNumber === 'number' && (badgeContent as unknown as number) > style.max) {
				this.ctx.font = this.ctx.font.replace(/\d+/, String(Number(this.ctx.font.match(/\d+/)![0]) / 1.175));
				badgeContent = `${style.max}+`;
			}

			if (Object.keys(badgeTypes).some(type => type === badgeContent)) {
				let y = radius;
				if (badgeContent === 'alert') {
					y = y / 0.625;
					this.ctx.font = this.ctx.font.replace(String(fontSize), String(fontSize * 2));
				}
				if (badgeContent === 'attention') {
					this.ctx.font = this.ctx.font.replace(String(fontSize), String(fontSize * 1.25));
				}
				if (badgeContent === 'error') {
					this.ctx.font = this.ctx.font.replace(String(fontSize), String(fontSize * 1.75));
				}
				if (['available', 'away', 'busy', 'unavailable'].some(status => status === badgeContent)) {
					this.ctx.font = this.ctx.font.replace(String(fontSize), String(fontSize * 4));
				}
				this.ctx.fillText(badgeTypes[badgeContent as string], radius, y);
			}
			if (typeof badgeNumber === 'number' && (badgeContent as string).length === 1) {
				this.ctx.fillText(badgeContent as string, radius, radius);
			}
			if (typeof badgeNumber === 'number' && (badgeContent as string).length > 1) {
				fontWidth = this.ctx.measureText(badgeContent as string).width;
				fontScale = (Math.cos(Math.atan(fontSize / fontWidth)) * this.radius * 2 / fontWidth);
				this.ctx.setTransform(fontScale, 0, 0, fontScale, this.radius, this.radius);
				this.ctx.fillText(badgeContent as string, 0, 0);
				this.ctx.setTransform(1, 0, 0, 1, 0, 0);
			}

			return this;
		};

		function getTextColor(bgColor: string): string {
			const red = parseInt(bgColor.substr(1, 2), 16);
			const green = parseInt(bgColor.substr(3, 2), 16);
			const blue = parseInt(bgColor.substr(5, 2), 16);
			const brightness = (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
			return (brightness > 128) ? '#000000' : '#FFFFFF';
		}

		function rgbToHex(r: string, g: string, b: string): string {
			const red = parseInt(r);
			const green = parseInt(g);
			const blue = parseInt(b);
			const rgb = blue | (green << 8) | (red << 16);
			return '#' + rgb.toString(16);
		}

		img.draw();
		return img.toDataURL();
	}
}
