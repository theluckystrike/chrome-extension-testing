/**
 * Test Helpers
 * Quick setup/teardown for Chrome extension test environments
 */

import { MockChromeStorage } from './mocks/storage';
import { MockChromeTabs } from './mocks/tabs';
import { MockChromeRuntime } from './mocks/runtime';
import { MockChromeAlarms } from './mocks/alarms';
import { MockChromeNotifications } from './mocks/notifications';

const storage = new MockChromeStorage();
const tabs = new MockChromeTabs();
const runtime = new MockChromeRuntime();
const alarms = new MockChromeAlarms();
const notifications = new MockChromeNotifications();

/**
 * Set up global chrome object with all mocks.
 * Call in beforeEach() of your test suite.
 */
export function setupChromeEnv(): void {
    (global as Record<string, unknown>).chrome = {
        storage: storage.api,
        tabs: tabs.api,
        runtime: runtime.api,
        alarms: alarms.api,
        notifications: notifications.api,
        windows: { WINDOW_ID_CURRENT: -2 },
        tabGroups: { TAB_GROUP_ID_NONE: -1 },
    };
}

/**
 * Reset all mock state.
 * Call in afterEach() of your test suite.
 */
export function resetChromeEnv(): void {
    storage.reset();
    tabs.reset();
    runtime.reset();
    alarms.reset();
    notifications.reset();
}

/** Simulate a fresh install event */
export function simulateInstall(): void { runtime.simulateInstall(); }

/** Simulate an update event */
export function simulateUpdate(previousVersion?: string): void { runtime.simulateUpdate(previousVersion); }

/** Get mock instances for direct manipulation */
export function getMocks() {
    return { storage, tabs, runtime, alarms, notifications };
}
