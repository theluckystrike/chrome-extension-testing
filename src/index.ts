/**
 * chrome-extension-testing
 * Testing utilities for Chrome extensions
 * Built by Zovo — https://zovo.one
 */

export { MockChromeStorage } from './mocks/storage';
export { MockChromeTabs } from './mocks/tabs';
export { MockChromeRuntime } from './mocks/runtime';
export { MockChromeAlarms } from './mocks/alarms';
export { MockChromeNotifications } from './mocks/notifications';
export { setupChromeEnv, resetChromeEnv, simulateInstall, simulateUpdate } from './helpers';
export { toHaveStorageValue, toHaveSentMessage, registerMatchers } from './matchers';
