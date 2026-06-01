[![version](https://img.shields.io/npm/v/electron-taskbar-badge?color=blueviolet&style=for-the-badge "Version")](https://github.com/NexovaDev/electron-taskbar-badge/releases/latest)
‎
[![weekly_downloads](https://img.shields.io/npm/dw/electron-taskbar-badge?color=blue&style=for-the-badge "Weekly Downloads")](https://www.npmjs.com/package/electron-taskbar-badge#:~:text=Weekly%20Downloads)
‎
![downloads](https://img.shields.io/npm/dt/electron-taskbar-badge?style=for-the-badge&logo=npm&color=%23ca0000&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Felectron-taskbar-badge "Downloads")
‎
[![issues](https://img.shields.io/github/issues/NexovaDev/electron-taskbar-badge?style=for-the-badge "Issues")](https://github.com/NexovaDev/electron-taskbar-badge/issues)
‎
[![license](https://img.shields.io/github/license/NexovaDev/electron-taskbar-badge?color=important&style=for-the-badge "License")](https://github.com/NexovaDev/electron-taskbar-badge/blob/master/LICENSE)
‎
[![electron-taskbar-badge](https://nodei.co/npm/electron-taskbar-badge.png "electron-taskbar-badge on NPM")](https://www.npmjs.com/package/electron-taskbar-badge)
---

# Electron Taskbar Badge
An easy way for electron apps to add app badges to the taskbar to indicate notifications, status, or countable items, with maximum compatibility and customizability.

---

# Changelog (`v2.0.0`)

• [BREAKING]: Rename `additionalFunc` to `onBadgeUpdate` for clarity purposes. This is simply a name change. \
• Font and radius is no longer a configurable option. \
• Improve text fitting in badge icon. (this removes the `fit` option) \
• Add new badge types: `activity`, `alarm`, `alert`, `attention`, `error`, `available`, `busy`, `away`, `unavailable`, `newMessage`, `paused`, `playing`. \
• Negative numbers and all falsy values now clear the badge icon. \
• Improve badge text centering. \
• Migrate source to TypeScript. \
• Expose `update()` as a public method on the `Badge` instance.

---

# Installation

```sh-session
npm i electron-taskbar-badge
```

---

# Basic Usage

> ⚠ **This library only supports Windows at the moment!**

First, you must import the library using the following code:
```javascript
const Badge = require('electron-taskbar-badge');
// or `import * as Badge from 'electron-taskbar-badge';` for ESM users
```
\
For basic usage, all you have to do is call the function with the options:
### Process: [**Main**](https://www.electronjs.org/docs/latest/glossary#main-process "Main")
```javascript
const Badge = require('electron-taskbar-badge');
// or `import * as Badge from 'electron-taskbar-badge';` for ESM users

const badgeOptions = {
	fontColor: '#FFFFFF', // The font color
	color: '#FF0000', // The background color
	updateBadgeEvent: 'notificationCount', // The IPC event name to listen on
	badgeDescription: 'Unread Notifications', // The badge description
	invokeType: 'handle', // The IPC event type
	max: 9, // The maximum integer allowed for the badge. Anything above this will have "+" added to the end of it.
	onBadgeUpdate: (count) => {
		// Called whenever the badge is updated. count is the value set (number, badge type string, or null when cleared).
		console.log(`Badge updated: ${count}`);
	},
};

// "win" would be your Electron BrowserWindow object
new Badge(win, badgeOptions);
```
### Process: [**Renderer**](https://www.electronjs.org/docs/latest/glossary#renderer-process "Renderer")
```js
// If invokeType is set to "handle"
// Replace 8 with whatever number or badge type you want the badge to display
ipcRenderer.invoke('notificationCount', 8);

// If invokeType is set to "send"
ipcRenderer.send('notificationCount', 8);
```

To clear the badge, simply pass a falsy value or a negative integer.

**That's it! Now you have it running!**

## More examples
### Badge types
Instead of a number, you can pass one of the following string values to display a glyph badge:

| Type | Icon | Description |
|------|------|-------------|
| `activity` | 🔄 | Activity indicator |
| `alarm` | 🕭 | Alarm indicator |
| `alert` | ! | Alert indicator |
| `attention` | ✱ | Attention indicator |
| `error` | ✕ | Error indicator |
| `available` | 🟢 | Available / online status |
| `busy` | 🔴 | Busy / occupied status |
| `away` | 🟡 | Away / idle status |
| `unavailable` | ⚪ | Unavailable / offline status |
| `newMessage` | ✉ | New message indicator |
| `paused` | ⏸ | Paused status |
| `playing` | ▶ | Playing / active playback |

<sub><sup>*Emoji's are an approximate representation. See [https://learn.microsoft.com/en-us/windows/apps/develop/notifications/badges](https://learn.microsoft.com/en-us/windows/apps/develop/notifications/badges#glyph-badges) for a more accurate visual.</sup></sub>

```js
// From the renderer
ipcRenderer.invoke('notificationCount', 'alert');

// Or directly from the main process
const badge = new Badge(win, badgeOptions);
badge.update('available');
```

### Native look
If you want your badge to look native to the operating system, which means that it follows the default OS's font and color, you can use the `useSystemAccentTheme` option. Here's an example:

```javascript
// When useSystemAccentTheme is true, the background color would be the system accent color, and the font color would be automatically chosen between black or white, which ever looks best.
const badgeOptions = {
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
```

**Examples**

![Taskbar Badge Purple](assets/taskbarBadgePurple.gif?raw=true) \
![Taskbar Badge Blue](assets/taskbarBadgeBlue.gif?raw=true) \
![Taskbar Badge Green](assets/taskbarBadgeGreen.gif?raw=true)

### Auto font color
If you want your badge's font color to be automatically chosen, simply set `fontColor` to `auto`. This will choose the font color between black or white, whichever looks best. Here's an example:

```javascript
const badgeOptions = {
	fontColor: 'auto',
	color: '#00FF00',
	updateBadgeEvent: 'notificationCount',
	badgeDescription: 'Unread Notifications',
	invokeType: 'handle',
	max: 9,
	onBadgeUpdate: (count) => {
		console.log(`Received ${count} new notifications!`);
	},
};

new Badge(win, badgeOptions);
```

# Options
### Options info for `Badge(options)`

| Parameters    | Type    | Description                            | Default    |
|---------------|---------|----------------------------------------|---------|
| `fontColor`    | string | The font color in hex or RGB color format. When `useSystemAccentTheme` is true, this is always set to auto.  | auto |
| `color` | string (required) | The background color for the badge icon in hex or RGB color format. When `useSystemAccentTheme` is true, this is ignored. | `null` |
| `updateBadgeEvent` | string (required) | The IPC event name to listen on | `null` |
| `badgeDescription` | string | A description that will be provided to accessibility screen readers | `this.updateBadgeEvent` |
| `invokeType` | string | The IPC event type. Can be `send` or `handle`. | send |
| `max` | number | The maximum integer allowed for the badge. Anything above this will have "+" added to the end of it. | 9 |
| `useSystemAccentTheme` | boolean | Whether to use the system accent color for the background color. fontColor and color will be overridden. It would be automatically chosen between black or white, whichever looks best. | `false` |
| `onBadgeUpdate` | function(count: number \| BadgeType \| null) | An additional function to run whenever the IPC event fires. Receives the value the badge was set to, or `null` when cleared. | `null` |

#
[![](assets/backToTop.png?raw=true "Back to top")](#readme)
