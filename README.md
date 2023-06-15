[![version](https://img.shields.io/npm/v/electron-taskbar-badge?color=blueviolet&style=for-the-badge "Version")](https://github.com/KK-Designs/electron-taskbar-badge/releases/tag/v1.4.1)
‎
[![weekly_downloads](https://img.shields.io/npm/dw/electron-taskbar-badge?color=blue&style=for-the-badge "Weekly Downloads")](https://www.npmjs.com/package/electron-taskbar-badge#:~:text=Weekly%20Downloads)
‎
![downloads](https://badgen.net/npm/dt/electron-taskbar-badge "Downloads")
‎
[![issues](https://img.shields.io/github/issues/KK-Designs/KK-Designs/electron-taskbar-badge?style=for-the-badge "Issues")](https://github.com/KK-Designs/electron-taskbar-badge/issues)
‎
[![license](https://img.shields.io/github/license/KK-Designs/electron-taskbar-badge?color=important&style=for-the-badge "License")](https://github.com/KK-Designs/electron-taskbar-badge/blob/master/LICENSE)
‎
[![electron-taskbar-badge](https://nodei.co/npm/electron-taskbar-badge.png "electron-taskbar-badge on NPM")](https://www.npmjs.com/package/electron-taskbar-badge)
---

# Electron Taskbar Badge
An easy way for electron apps to add app badges to the taskbar to indicate notifications and other countable things, with maximum compatibility and customizability.

---

# Changelog (`v1.0.0`)

• This release is the first release of Electron Taskbar Badge

---

# Installation

```sh-session
npm i electron-taskbar-badge
```

---

# Basic Usage

> ⚠ **This library is ONLY compatible with node version 14 and above**

First you must import the library using the following code:
```javascript
const Badge = require('electron-taskbar-badge');
// or `import * as Badge from 'electron-taskbar-badge';` for ESM users
```
\
For basic usage, all you have to do is call the function with the options:
```javascript
const Badge = require('electron-taskbar-badge');
// or `import * as Badge from 'electron-taskbar-badge';` for ESM users

// NOTE: Although the font size 62px seems large, it is not. It is relative the the radius. Lowering both of these values can decrease quality significantly. Increasing them can reduce performance. Leave the font size as is for basic usage
const badgeOptions = {
	fontColor: '#FFFFFF', // The font color
	font: '62px Microsoft Yahei', // The font and its size. You shouldn't have to change this at all
	color: '#FF0000', // The background color
	radius: 48, // The radius for the badge circle. You shouldn't have to change this at all
	updateBadgeEvent: 'notificationCount', // The IPC event name to listen on
	badgeDescription: 'Unread Notifications', // The badge description
	invokeType: 'handle', // The IPC event type
	max: 9, // The maximum integer allowed for the badge. Anything above this will have "+" added to the end of it.
	fit: false, // Useful for multi-digit numbers. For single digit keep this set to false
	additionalFunc: (count) => {
		// An additional function to run whenever the IPC event fires. It has a count parameter which is the number that the badge was set to.
		console.log(`Received ${count} new notifications!`);
	},
};

// "win" would be your Electron BrowserWindow object
new Badge(win, badgeOptions);
```
**Thats it! Now you have it running!**

## More examples
### Native look
If you want your badge to look native to the operating system, which means that it follows the default OS's font and color, you can use the `useSystemAccentTheme` option. Here's an example:

```javascript
// DO NOT change the font or the radius
// fontColor and color will be overridden. The background color would be the system accent color, and the font color would be automatically chosen between black or white, whichever looks best.
const badgeOptions = {
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
```

**Examples**

![Taskbar Badge Purple](assets/taskbarBadgePurple.gif?raw=true) \
![Taskbar Badge Blue](assets/taskbarBadgeBlue.gif?raw=true) \
![Taskbar Badge Green](assets/taskbarBadgeGreen.gif?raw=true)

### Auto font color
If you want your badge's font color to be automatically chosen, simply set `fontColor` to `auto`. This will chose the font color between black or white, whichever looks best. Here's an example:

```javascript
const badgeOptions = {
	fontColor: 'auto',
	font: '62px Microsoft Yahei',
	color: '#00FF00',
	radius: 48,
	updateBadgeEvent: 'notificationCount',
	badgeDescription: 'Unread Notifications',
	invokeType: 'handle',
	max: 9,
	fit: false,
	additionalFunc: (count) => {
		console.log(`Received ${count} new notifications!`);
	},
};

new Badge(win, badgeOptions);
```

# Options
### Options info for `Badge(options)`

| Parameters    | Type    | Description                            | Default    |
|---------------|---------|----------------------------------------|---------|
| `fontColor`    | string (required) | The font color. Pretty self explanatory.  | auto |
| `font`    | string | The font for the badge icon. The format is [size]px [Font family name] **ALWAYS SET THE FONT SIZE TO 62px FOR BEST QUALITY** | 62px Microsoft Yahei |
| `color` | string (required) | The background color for the badge icon | `null` |
| `radius` | number | The radius for the badge icon **ALWAYS SET TO 48 FOR BEST QUALITY** | 48 |
| `updateBadgeEvent` | string (required) | The IPC event name to listen on | `null` |
| `badgeDescription` | string | A description that will be provided to Accessibility screen readers | `this.updateBadgeEvent` |
| `invokeType` | string | The IPC event type. Can be `send` or `handle`. | send |
| `max` | number | The maximum integer allowed for the badge. Anything above this will have "+" added to the end of it. | 99 |
| `fit` | boolean | The maximum integer allowed for the badge. Anything above this will have "+" added to the end of it. | `false` |
| `useSystemAccentTheme` | boolean | Whether to use the system accent color for the background color. fontColor and color will be overridden. It would be automatically chosen between black or white, whichever looks best. | `false` |
| `additionalFunc` | function(count) | An additional function to run whenever the IPC event fires. It has a count parameter which is the number that the badge was set to. | `null` |

#
[![](assets/backToTop.png?raw=true "Back to top")](#readme)
