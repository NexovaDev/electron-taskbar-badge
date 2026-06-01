import { nativeImage, ipcMain, systemPreferences } from 'electron';
import type { BrowserWindow, NativeImage } from 'electron';
import { execSync } from 'child_process';
import * as fs from 'fs';
import BadgeGenerator from './badge_generator';

export type BadgeType = 'alert' | 'attention' | 'error' | 'available' | 'away' | 'busy' | 'unavailable';

export interface BadgeOptions {
	fontColor?: string;
	color: string;
	updateBadgeEvent: string;
	badgeDescription?: string;
	invokeType?: 'send' | 'handle';
	max?: number;
	useSystemAccentTheme?: boolean;
	onBadgeUpdate?: (count: number | BadgeType | null) => void;
}

let badgeDescription = 'New notification';
let UPDATE_BADGE_EVENT!: string;
let invokeType: 'send' | 'handle' = 'send';
let onBadgeUpdate: (count: number | BadgeType | null) => void = () => { /* ... */ };
let currentOverlayIcon: { image: NativeImage | null; badgeDescription: string } = { image: null, badgeDescription };
let currentNumber: number | BadgeType | null = null;

let powershell = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe';
if (!fs.existsSync(powershell)) {
	powershell = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
}

/**
 * @example
 * ```js
 * const badgeOptions = {
 *     fontColor: 'auto',
 *     color: '#000000',
 *     updateBadgeEvent: 'notificationCount',
 *     badgeDescription: 'Unread Notifications',
 *     invokeType: 'handle',
 *     max: 9,
 *     useSystemAccentTheme: true,
 *     onBadgeUpdate: (count) => {
 *         console.log(`Received ${count} new notifications!`);
 *     },
 * };
 * new Badge(win, badgeOptions);
 * ```
 * @since 1.0.0
 */
export default class Badge {
	private win: BrowserWindow | null;
	private opts: BadgeOptions;
	private generator: BadgeGenerator;

	/**
	 * @param win - The Electron BrowserWindow to attach the badge to
	 * @param opts - Badge configuration options
	 */
	constructor(win: BrowserWindow, opts: BadgeOptions) {
		if (process.platform !== 'win32') console.warn('Only win32 environments are supported!');
		this.win = win;
		this.opts = opts;
		const accentColor = getLightAccentColor(powershell);
		this.generator = new BadgeGenerator(win, opts, accentColor);
		systemPreferences.on('accent-color-changed', () => {
			this.generator = new BadgeGenerator(win, opts, getLightAccentColor(powershell));
			if (currentNumber !== null) this.generator.generate(currentNumber);
			this.update(currentNumber);
		});
		if (typeof opts?.updateBadgeEvent !== 'string') {
			throw new TypeError(`Invalid IPC event handler name specified.\nExpected: string\nGot: ${typeof opts?.updateBadgeEvent}`);
		}
		UPDATE_BADGE_EVENT = opts.updateBadgeEvent;
		badgeDescription = opts.badgeDescription ?? UPDATE_BADGE_EVENT;
		invokeType = opts.invokeType ?? 'send';
		onBadgeUpdate = opts.onBadgeUpdate ?? onBadgeUpdate;
		this.initListeners();
		this.win.on('closed', () => { this.win = null; });
		this.win.on('show', () => { this.win?.setOverlayIcon(currentOverlayIcon.image, currentOverlayIcon.badgeDescription); });
	}

	update(badge: number | BadgeType | null): void {
		const badgeTypes: BadgeType[] = [
			'alert', 'attention', 'error', 'available', 'away', 'busy', 'unavailable',
		];

		// All falsy values and negative numbers clear the icon
		if (!badge || (typeof badge === 'number' && badge < 0)) {
			currentOverlayIcon = { image: null, badgeDescription };
			this.win?.setOverlayIcon(currentOverlayIcon.image, currentOverlayIcon.badgeDescription);
			return;
		}

		// Validate truthy positive values
		if (typeof badge !== 'number' && typeof badge !== 'string') {
			throw new TypeError(`Invalid badge specified.\nExpected: number or string\nGot: ${typeof badge}`);
		}
		if (typeof badge === 'number' && !Number.isFinite(badge)) {
			throw new TypeError(`Invalid badge number specified.\nExpected: positive finite number\nGot: ${badge}`);
		}
		if (typeof badge === 'string' && !badgeTypes.some(type => type === badge)) {
			if (parseInt(badge) >= 0) {
				badge = parseInt(badge);
			} else {
				throw new TypeError(`Invalid badge specified.\nExpected: ${badgeTypes.join(' | ')}\nGot: ${badge}`);
			}
		}

		// Generate and display badge
		this.generator.generate(badge).then((base64: string) => {
			const image = nativeImage.createFromDataURL(base64);
			currentOverlayIcon = { image, badgeDescription };
			this.win?.setOverlayIcon(currentOverlayIcon.image, currentOverlayIcon.badgeDescription);
			currentNumber = badge;
		});
	}

	private initListeners(): void {
		if (invokeType === 'send') {
			ipcMain.on(UPDATE_BADGE_EVENT, (event, badge: number | BadgeType | null) => {
				if (this.win) {
					this.update(badge);
					onBadgeUpdate(badge);
				}
				event.returnValue = 'success';
			});
		} else {
			ipcMain.handle(UPDATE_BADGE_EVENT, (_event, badge: number | BadgeType | null) => {
				if (this.win) {
					this.update(badge);
					onBadgeUpdate(badge);
				}
			});
		}
	}
}

function getLightAccentColor(pwsh: string): string {
	let accentColorData: number[];
	try {
		accentColorData = (JSON.parse(
			execSync(`"${pwsh}" -NoProfile -Command "Get-ItemProperty -Path 'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent' | Select-Object AccentPalette | ConvertTo-Json"`).toString(),
		) as { AccentPalette: number[] }).AccentPalette;
	} catch {
		return '#4cc2ff';
	}
	const accentColorLight = Array.from(
		{ length: Math.ceil(accentColorData.length / 4) },
		(_, i) => accentColorData.slice(i * 4, i * 4 + 4),
	).map(arr => arr.slice(0, arr.length - 1))[1];
	return rgbToHex(accentColorLight[0], accentColorLight[1], accentColorLight[2]);
}

function rgbToHex(r: number, g: number, b: number): string {
	const rgb = parseInt(String(b)) | (parseInt(String(g)) << 8) | (parseInt(String(r)) << 16);
	return '#' + rgb.toString(16);
}
