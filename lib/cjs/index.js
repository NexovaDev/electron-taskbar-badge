const { nativeImage, ipcMain, systemPreferences } = require('electron');
const BadgeGenerator = require('./badge_generator.js');
let badgeDescription = 'New notification';
let UPDATE_BADGE_EVENT;
let invokeType = 'send';
let additionalFunc = () => {
	// Empty for now...
};
let currentOverlayIcon = { image: null, badgeDescription };

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
		this.win = win;
		this.opts = opts;
		this.generator = new BadgeGenerator(win, opts, systemPreferences.getAccentColor());
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
		if (badgeNumber) {
			this.generator.generate(badgeNumber).then((base64) => {
				const image = nativeImage.createFromDataURL(base64);
				currentOverlayIcon = {
					image,
					badgeDescription,
				};
				this.win.setOverlayIcon(currentOverlayIcon.image, currentOverlayIcon.badgeDescription);
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