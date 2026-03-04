# chrome-extension-testing

> Testing utilities for Chrome extensions -- realistic `chrome.*` API mocks for Jest, custom matchers, and test helpers.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Install

```bash
npm install --save-dev chrome-extension-testing
```

Peer dependency: `jest >= 29.0.0` (optional).

## Usage

### Basic Setup

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

// Seed tabs for testing
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

### Simulating Install and Update Events

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

## Supported APIs

| Mock Class | API | Methods and Events |
| --- | --- | --- |
| `MockChromeStorage` | `chrome.storage` | `local`, `sync`, `session` areas -- `get`, `set`, `remove`, `clear`, `getBytesInUse`, `onChanged` |
| `MockChromeTabs` | `chrome.tabs` | `query`, `get`, `create`, `remove`, `update`, `reload`, `discard`, `group`, `ungroup`, `onCreated`, `onRemoved`, `onUpdated`, `onActivated` |
| `MockChromeRuntime` | `chrome.runtime` | `sendMessage`, `onMessage`, `onInstalled`, `getManifest`, `getURL`, `id`, `lastError` |
| `MockChromeAlarms` | `chrome.alarms` | `create`, `get`, `getAll`, `clear`, `clearAll`, `onAlarm` |
| `MockChromeNotifications` | `chrome.notifications` | `create`, `clear`, `getAll`, `onClicked`, `onClosed` |

## API

### Helpers

| Function | Signature | Description |
| --- | --- | --- |
| `setupChromeEnv` | `() => void` | Set up `global.chrome` with all mocks. Call in `beforeEach`. |
| `resetChromeEnv` | `() => void` | Reset all mock state. Call in `afterEach`. |
| `simulateInstall` | `() => void` | Fire `onInstalled` listeners with `reason: 'install'`. |
| `simulateUpdate` | `(previousVersion?: string) => void` | Fire `onInstalled` listeners with `reason: 'update'`. |
| `getMocks` | `() => { storage, tabs, runtime, alarms, notifications }` | Get mock instances for direct manipulation. |

### Matchers

| Matcher | Signature | Description |
| --- | --- | --- |
| `toHaveStorageValue` | `(key: string, expectedValue: unknown)` | Assert a storage object contains a specific key-value pair. |
| `toHaveSentMessage` | `(expectedMessage: unknown)` | Assert a message was sent through runtime messaging. |
| `registerMatchers` | `() => void` | Register all custom matchers with Jest's `expect.extend`. |

### MockChromeStorage

| Method | Description |
| --- | --- |
| `api` | Returns the full `chrome.storage` mock object (`local`, `sync`, `session`, `onChanged`). |
| `getStore(area: string)` | Get a copy of the raw storage data for assertions. |
| `seed(area: string, data: Record<string, unknown>)` | Pre-populate a storage area with data. |
| `reset()` | Clear all areas and listeners. |

### MockChromeTabs

| Method | Description |
| --- | --- |
| `api` | Returns the full `chrome.tabs` mock object. |
| `addTab(props?: Partial<MockTab>)` | Add a tab to the virtual tab pool (for setup, does not fire `onCreated`). Returns the tab. |
| `count` | Get the current number of tabs. |
| `reset()` | Remove all tabs and reset ID counter. |

### MockChromeRuntime

| Method | Description |
| --- | --- |
| `api` | Returns the full `chrome.runtime` mock object. |
| `simulateInstall()` | Fire `onInstalled` with `reason: 'install'`. |
| `simulateUpdate(previousVersion?: string)` | Fire `onInstalled` with `reason: 'update'`. Default previous version: `'0.9.0'`. |
| `getSentMessages()` | Get array of all sent messages and their responses. |
| `setManifest(data: Record<string, unknown>)` | Override manifest data returned by `getManifest()`. |
| `reset()` | Clear all listeners and sent messages. |

### MockChromeAlarms

| Method | Description |
| --- | --- |
| `api` | Returns the full `chrome.alarms` mock object. |
| `fireAlarm(name: string)` | Manually trigger alarm listeners for a specific alarm. |
| `fireAll()` | Trigger alarm listeners for all registered alarms. |
| `reset()` | Clear all alarms and listeners. |

### MockChromeNotifications

| Method | Description |
| --- | --- |
| `api` | Returns the full `chrome.notifications` mock object. |
| `simulateClick(id: string)` | Fire `onClicked` listeners with the given notification ID. |
| `simulateClose(id: string)` | Fire `onClosed` listeners with the given notification ID. |
| `getNotification(id: string)` | Get the stored notification data by ID. |
| `reset()` | Clear all notifications and listeners. |

## License

MIT
