# chrome-extension-testing

[![npm version](https://img.shields.io/npm/v/chrome-extension-testing)](https://npmjs.com/package/chrome-extension-testing)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

Testing utilities for Chrome extensions. Provides realistic in-memory mocks for the chrome.storage, chrome.tabs, chrome.runtime, chrome.alarms, and chrome.notifications APIs. Includes custom Jest matchers and lifecycle helpers for setting up and tearing down test environments.

Built for Manifest V3 extensions. Works with Jest 29+.

INSTALL

```bash
npm install --save-dev chrome-extension-testing
```

Peer dependency jest >= 29.0.0 is optional.

QUICK START

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

MESSAGE PASSING

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

TAB MANAGEMENT

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

STORAGE WITH CHANGE LISTENERS

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

ALARMS

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

NOTIFICATIONS

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

INSTALL AND UPDATE EVENTS

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

CUSTOM JEST MATCHERS

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

SUPPORTED APIS

| Mock Class | Chrome API | Methods and Events |
| --- | --- | --- |
| MockChromeStorage | chrome.storage | local, sync, session areas with get, set, remove, clear, getBytesInUse, onChanged |
| MockChromeTabs | chrome.tabs | query, get, create, remove, update, reload, discard, group, ungroup, onCreated, onRemoved, onUpdated, onActivated |
| MockChromeRuntime | chrome.runtime | sendMessage, onMessage, onInstalled, getManifest, getURL, id, lastError |
| MockChromeAlarms | chrome.alarms | create, get, getAll, clear, clearAll, onAlarm |
| MockChromeNotifications | chrome.notifications | create, clear, getAll, onClicked, onClosed |

HELPERS

| Function | Description |
| --- | --- |
| setupChromeEnv() | Sets up global.chrome with all mocks. Call in beforeEach. |
| resetChromeEnv() | Resets all mock state. Call in afterEach. |
| simulateInstall() | Fires onInstalled listeners with reason install. |
| simulateUpdate(previousVersion?) | Fires onInstalled listeners with reason update. |
| getMocks() | Returns all mock instances for direct manipulation. |
| registerMatchers() | Registers toHaveStorageValue and toHaveSentMessage with Jest expect.extend. |

LICENSE

MIT. See LICENSE file.

CONTRIBUTING

See CONTRIBUTING.md for guidelines.

---

Built by theluckystrike. Visit [zovo.one](https://zovo.one) for more.
