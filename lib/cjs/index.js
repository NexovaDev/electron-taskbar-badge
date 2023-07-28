const { nativeImage, ipcMain, systemPreferences } = require('electron');
const fs = require('fs');
const BadgeGenerator = require('./badge_generator.js');
let badgeDescription = 'New notification';
let UPDATE_BADGE_EVENT;
let invokeType = 'send';
let additionalFunc = () => {
	// Empty for now...
};
let currentOverlayIcon = { image: null, badgeDescription };
let currentNumber = null;
let powershell = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe';

if (!fs.existsSync('C:\\Program Files\\PowerShell\\7\\pwsh.exe')) {
	powershell = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
}

/**
 * @example const badgeOptions = {
				fontColor: '#000000',
				font: '62px Microsoft Yahei',
				color: '#000000',
				radius: 48,
				updateBadgeEvent: 'notificationCount',
				badgeDescription: 'Unread Notifications',
				invokeType: 'handle',
				max: 9,
				fit: false,
				useSystemAccentTheme: true,
				additionalFunc: (count) => {
					console.log(`Received ${count} new notifications!`);
				},
			};

			new Badge(win, badgeOptions);
	* @since 1.0.0
	* @param {Electron.BrowserWindow} win
	* @param {object} badgeOptions
	* @returns {void}
*/
module.exports = class Badge {
	constructor(win, opts = {}) {
		if (process.platform == 'win32') console.warn('Only win32 environments are supported!');
		this.win = win;
		this.opts = opts;
		const accentColor = getLightAccentColor(powershell);
		this.generator = new BadgeGenerator(win, opts, accentColor);
		systemPreferences.on('accent-color-changed', () => {
			this.generator = new BadgeGenerator(win, opts, getLightAccentColor(powershell));
			this.generator.generate(currentNumber, true);
			this.update(currentNumber);
		});
		if (typeof opts?.updateBadgeEvent !== 'string') {
			throw new TypeError(`Invalid IPC event handler name specified.\nExpected: string\nGot: ${typeof opts?.updateBadgeEvent}`);
		}
		UPDATE_BADGE_EVENT = opts?.updateBadgeEvent ?? 'update-badge';
		badgeDescription = opts?.badgeDescription ?? UPDATE_BADGE_EVENT;
		invokeType = opts?.invokeType ?? 'send';
		additionalFunc = opts?.additionalFunc ?? additionalFunc;
		this.initListeners();
		this.win.on('closed', () => { this.win = null; });
		this.win.on('show', () => { this.win.setOverlayIcon(currentOverlayIcon.image, currentOverlayIcon.badgeDescription); });
	}

	update(badgeNumber) {
		if (typeof badgeNumber !== 'number' && badgeNumber != null) {
			throw new TypeError(`Invalid badgeNumber specified.\nExpected: number\nGot: ${typeof badgeNumber}`);
		}
		if (badgeNumber) {
			this.generator.generate(badgeNumber).then((base64) => {
				const image = nativeImage.createFromDataURL(base64);
				currentOverlayIcon = {
					image,
					badgeDescription,
				};
				this.win.setOverlayIcon(currentOverlayIcon.image, currentOverlayIcon.badgeDescription);
				currentNumber = badgeNumber;
			});
		} else {
			currentOverlayIcon = {
				image: null,
				badgeDescription,
			};
			this.win.setOverlayIcon(currentOverlayIcon.image, currentOverlayIcon.badgeDescription);
		}
	}

	initListeners() {
		if (invokeType.includes('send')) {
			ipcMain.on(UPDATE_BADGE_EVENT, (event, badgeNumber) => {
				if (this.win) {
					this.update(badgeNumber);
					additionalFunc(badgeNumber);
				}
				event.returnValue = 'success';
			});
		} else {
			ipcMain.handle(UPDATE_BADGE_EVENT, (event, badgeNumber) => {
				if (this.win) {
					this.update(badgeNumber);
					additionalFunc(badgeNumber);
				}
				event.returnValue = 'success';
			});
		}
	}
};

function getLightAccentColor(pwsh) {
	let accentColorData;
	try {
		accentColorData = JSON.parse(require('child_process').execSync(`"${pwsh}" -NoProfile -Command "Get-ItemProperty -Path 'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent' | Select-Object AccentPalette | ConvertTo-Json"`).toString()).AccentPalette;
	} catch (error) {
		return '#4cc2ff';
	}
	const accentColorLight = Array.from({ length: Math.ceil(accentColorData.length / 4) }, (_, i) => accentColorData.slice(i * 4, i * 4 + 4)).map(arr => arr.slice(0, arr.length - 1))[1];

	return rgbToHex.apply(null, [...accentColorLight]);
}

function rgbToHex(r, g, b) {
	const red = parseInt(r);
	const green = parseInt(g);
	const blue = parseInt(b);

	const rgb = blue | (green << 8) | (red << 16);
	return '#' + rgb.toString(16);
}