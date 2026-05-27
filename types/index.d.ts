type BadgeType = 'alert' | 'attention' | 'error' | 'available' | 'away' | 'busy' | 'unavailable';

export interface BadgeOptions {
	fontColor?: string,
	color: string,
	updateBadgeEvent: string,
	badgeDescription?: string,
	invokeType?: 'send' | 'handle',
	max?: number,
	useSystemAccentTheme?: boolean,
	onBadgeUpdate?: (count: number | BadgeType | null) => void
}

/**
 * @example const badgeOptions = {
				fontColor: 'auto',
				color: '#000000',
				updateBadgeEvent: 'notificationCount',
				badgeDescription: 'Unread Notifications',
				invokeType: 'handle',
				max: 9,
				useSystemAccentTheme: true,
				onBadgeUpdate: (count) => {
					console.log(`Received ${count} new notifications!`);
				},
			};

			new Badge(win, badgeOptions);
 * @since 1.0.0
 * @param { import('electron').BrowserWindow } win
 * @param { BadgeOptions } opts
 * @returns { void }
*/

export default class Badge {
	constructor(win: import('electron').BrowserWindow, opts: BadgeOptions)
	update(badge: number | BadgeType | null): void
}
