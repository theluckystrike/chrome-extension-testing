# chrome-extension-testing — Mock Chrome APIs for Jest

[![npm](https://img.shields.io/npm/v/chrome-extension-testing.svg)](https://www.npmjs.com/package/chrome-extension-testing)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)]()

> **Built by [Zovo](https://zovo.one)** — we test 18+ Chrome extensions with these exact mocks

**The missing testing library for Chrome extension developers.** Realistic `chrome.*` API mocks for Jest with custom matchers and test helpers.

## 📦 Install

```bash
npm install --save-dev chrome-extension-testing
```

## 🚀 Quick Start

```typescript
import { setupChromeEnv, resetChromeEnv, getMocks } from 'chrome-extension-testing';

beforeEach(() => setupChromeEnv());
afterEach(() => resetChromeEnv());

test('saves settings to storage', async () => {
  await chrome.storage.local.set({ theme: 'dark' });
  const result = await chrome.storage.local.get('theme');
  expect(result.theme).toBe('dark');
});

test('handles messages', async () => {
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'PING') sendResponse({ type: 'PONG' });
  });
  const response = await chrome.runtime.sendMessage({ type: 'PING' });
  expect(response).toEqual({ type: 'PONG' });
});
```

## ✨ What's Mocked

| API | Features |
|-----|----------|
| `chrome.storage` | `.local`, `.sync`, `.session` — get, set, remove, clear, onChanged |
| `chrome.tabs` | query, create, remove, update, group/ungroup, onCreated/onRemoved/onUpdated |
| `chrome.runtime` | sendMessage, onMessage, onInstalled, getManifest, getURL |
| `chrome.alarms` | create, get, getAll, clear, onAlarm + manual fire |
| `chrome.notifications` | create, clear, getAll + click/close simulation |

## 🧪 Custom Jest Matchers

```typescript
import { registerMatchers, getMocks } from 'chrome-extension-testing';
registerMatchers();

test('storage assertions', async () => {
  await chrome.storage.local.set({ count: 42 });
  const store = getMocks().storage.getStore('local');
  expect(store).toHaveStorageValue('count', 42);
});
```

## 🔗 Part of the Zovo Chrome Extension Toolkit
- [chrome-extension-starter-mv3](https://github.com/theluckystrike/chrome-extension-starter-mv3) — MV3 boilerplate
- [chrome-storage-plus](https://github.com/theluckystrike/chrome-storage-plus) — Storage wrapper
- [extension-analytics](https://github.com/theluckystrike/extension-analytics) — Privacy-first analytics
- [extension-permissions](https://github.com/theluckystrike/extension-permissions) — Permission management
- [chrome-devtools-kit](https://github.com/theluckystrike/chrome-devtools-kit) — DevTools panels

## 📄 License
MIT — [Zovo](https://zovo.one)
