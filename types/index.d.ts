interface BadgeOptions {
	fontColor: string,
	font: string,
	color: string,
	radius: number,
	updateBadgeEvent: string,
	badgeDescription: string,
	invokeType: string,
	max: number,
	fit: boolean,
	useSystemAccentTheme: boolean,
	additionalFunc(count: number): void
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
 * @param {BrowserWindow} win
 * @param {object} opts
 * @returns {void}
*/

export default class Badge {
	constructor(win: object, opts: BadgeOptions)
}