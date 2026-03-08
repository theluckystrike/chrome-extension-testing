# chrome-extension-testing

[![npm](https://img.shields.io/npm/v/chrome-extension-testing)](https://www.npmjs.com/package/chrome-extension-testing)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Last Commit](https://img.shields.io/github/last-commit/theluckystrike/chrome-extension-testing/main)](https://github.com/theluckystrike/chrome-extension-testing/commits/main)

Testing utilities for Chrome extensions with realistic Chrome API mocks for Jest. Provides comprehensive in-memory implementations of `chrome.storage`, `chrome.tabs`, `chrome.runtime`, `chrome.alarms`, and `chrome.notifications` APIs—plus custom Jest matchers and lifecycle helpers for setting up and tearing down test environments.

Built for Manifest V3 extensions. Works with Jest 29+.

## Installation

```bash
npm install --save-dev chrome-extension-testing
```

> **Note:** Peer dependency `jest >= 29.0.0` is optional but recommended for full functionality.

## Quick Start

```typescript
import { setupChromeEnv, resetChromeEnv } from 'chrome-extension-testing';

beforeEach(() => setupChromeEnv());
afterEach(() => resetChromeEnv());

test('saves settings to chrome.storage.local', async () => {
  await chrome.storage.local.set({ theme: 'dark' });
  const result = await chrome.storage.local.get('theme');
  expect(result.theme).toBe('dark');
});
```

## Usage Examples

### Message Passing

```typescript
import { setupChromeEnv, resetChromeEnv } from 'chrome-extension-testing';

beforeEach(() => setupChromeEnv());
afterEach(() => resetChromeEnv());

test('handles runtime messages', async () => {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'PING') sendResponse({ type: 'PONG' });
  });

  const response = await chrome.runtime.sendMessage({ type: 'PING' });
  expect(response).toEqual({ type: 'PONG' });
});
```

### Tab Management

```typescript
import { MockChromeTabs } from 'chrome-extension-testing';

const tabs = new MockChromeTabs();

tabs.addTab({ url: 'https://example.com', title: 'Example', active: true });
tabs.addTab({ url: 'https://github.com', title: 'GitHub' });

test('queries active tabs', async () => {
  const activeTabs = await tabs.api.query({ active: true });
  expect(activeTabs).toHaveLength(1);
  expect(activeTabs[0].url).toBe('https://example.com');
});

test('creates and removes tabs', async () => {
  const tab = await tabs.api.create({ url: 'https://new-tab.com' });
  expect(tabs.count).toBe(3);

  await tabs.api.remove(tab.id);
  expect(tabs.count).toBe(2);
});
```

### Storage with Change Listeners

```typescript
import { MockChromeStorage } from 'chrome-extension-testing';

const storage = new MockChromeStorage();

test('fires onChanged listeners', async () => {
  const listener = jest.fn();
  storage.api.onChanged.addListener(listener);

  await storage.api.local.set({ count: 42 });

  expect(listener).toHaveBeenCalledWith(
    { count: { oldValue: undefined, newValue: 42 } },
    'local'
  );
});

test('seed storage with initial data', () => {
  storage.seed('local', { theme: 'dark', lang: 'en' });
  const store = storage.getStore('local');
  expect(store.theme).toBe('dark');
});
```

### Alarms

```typescript
import { MockChromeAlarms } from 'chrome-extension-testing';

const alarms = new MockChromeAlarms();

test('fires alarm callbacks', async () => {
  const handler = jest.fn();
  alarms.api.onAlarm.addListener(handler);

  await alarms.api.create('reminder', { delayInMinutes: 5 });
  alarms.fireAlarm('reminder');

  expect(handler).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'reminder' })
  );
});
```

### Notifications

```typescript
import { MockChromeNotifications } from 'chrome-extension-testing';

const notifications = new MockChromeNotifications();

test('creates and clicks notifications', async () => {
  const clickHandler = jest.fn();
  notifications.api.onClicked.addListener(clickHandler);

  const id = await notifications.api.create('alert-1', {
    type: 'basic',
    title: 'Heads up',
    message: 'Something happened',
  });

  notifications.simulateClick(id);
  expect(clickHandler).toHaveBeenCalledWith('alert-1');
  expect(notifications.getNotification(id)).toEqual({
    title: 'Heads up',
    message: 'Something happened',
    type: 'basic',
  });
});
```

### Install and Update Events

```typescript
import { setupChromeEnv, resetChromeEnv, simulateInstall, simulateUpdate } from 'chrome-extension-testing';

beforeEach(() => setupChromeEnv());
afterEach(() => resetChromeEnv());

test('handles extension install', () => {
  const handler = jest.fn();
  chrome.runtime.onInstalled.addListener(handler);

  simulateInstall();
  expect(handler).toHaveBeenCalledWith({ reason: 'install' });
});

test('handles extension update', () => {
  const handler = jest.fn();
  chrome.runtime.onInstalled.addListener(handler);

  simulateUpdate('1.0.0');
  expect(handler).toHaveBeenCalledWith({ reason: 'update', previousVersion: '1.0.0' });
});
```

### Custom Jest Matchers

```typescript
import { registerMatchers, MockChromeStorage } from 'chrome-extension-testing';

registerMatchers();

const storage = new MockChromeStorage();

test('toHaveStorageValue matcher', async () => {
  await storage.api.local.set({ count: 42 });
  const store = storage.getStore('local');
  expect(store).toHaveStorageValue('count', 42);
});
```

## API Reference

### Mock Classes

| Mock Class | Chrome API | Description |
|------------|------------|-------------|
| `MockChromeStorage` | `chrome.storage` | In-memory storage with local, sync, and session areas |
| `MockChromeTabs` | `chrome.tabs` | Virtual tab pool for tab management testing |
| `MockChromeRuntime` | `chrome.runtime` | Messaging, install events, and extension context |
| `MockChromeAlarms` | `chrome.alarms` | Timer simulation for alarm-based extensions |
| `MockChromeNotifications` | `chrome.notifications` | Notification creation and event simulation |

### Storage API Methods & Events

- **Areas**: `local`, `sync`, `session`
- **Methods**: `get`, `set`, `remove`, `clear`, `getBytesInUse`
- **Events**: `onChanged`

### Tabs API Methods & Events

- **Methods**: `query`, `get`, `create`, `remove`, `update`, `reload`, `discard`, `group`, `ungroup`
- **Events**: `onCreated`, `onRemoved`, `onUpdated`, `onActivated`

### Runtime API Methods & Events

- **Methods**: `sendMessage`, `getManifest`, `getURL`
- **Properties**: `id`, `lastError`
- **Events**: `onMessage`, `onInstalled`

### Alarms API Methods & Events

- **Methods**: `create`, `get`, `getAll`, `clear`, `clearAll`
- **Events**: `onAlarm`

### Notifications API Methods & Events

- **Methods**: `create`, `clear`, `getAll`
- **Events**: `onClicked`, `onClosed`

### Helper Functions

| Function | Description |
|----------|-------------|
| `setupChromeEnv()` | Sets up `global.chrome` with all mocks. Call in `beforeEach`. |
| `resetChromeEnv()` | Resets all mock state. Call in `afterEach`. |
| `simulateInstall()` | Fires `onInstalled` listeners with reason `install`. |
| `simulateUpdate(previousVersion?)` | Fires `onInstalled` listeners with reason `update`. |
| `getMocks()` | Returns all mock instances for direct manipulation. |
| `registerMatchers()` | Registers `toHaveStorageValue` and `toHaveSentMessage` with Jest `expect.extend`. |

## Project Structure

```
chrome-extension-testing/
├── src/
│   ├── index.ts              # Main exports
│   ├── helpers.ts            # Test setup/teardown helpers
│   ├── matchers.ts           # Custom Jest matchers
│   └── mocks/
│       ├── storage.ts        # chrome.storage mock
│       ├── tabs.ts           # chrome.tabs mock
│       ├── runtime.ts        # chrome.runtime mock
│       ├── alarms.ts         # chrome.alarms mock
│       └── notifications.ts # chrome.notifications mock
├── package.json
├── tsconfig.json
├── LICENSE
├── CHANGELOG.md
└── README.md
```

## License

MIT. See [LICENSE](LICENSE) file.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

Built at [zovo.one](https://zovo.one) by [theluckystrike](https://github.com/theluckystrike)
