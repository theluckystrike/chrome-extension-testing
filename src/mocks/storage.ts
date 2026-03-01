/**
 * Mock chrome.storage API
 * Full in-memory implementation of chrome.storage.local, sync, and session
 *
 * Usage in Jest:
 *   import { MockChromeStorage } from 'chrome-extension-testing';
 *   const storage = new MockChromeStorage();
 *   global.chrome = { storage: storage.api };
 */

type StorageCallback = (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>, areaName: string) => void;

export class MockChromeStorage {
    private stores: Record<string, Record<string, unknown>> = {
        local: {},
        sync: {},
        session: {},
    };
    private listeners: StorageCallback[] = [];

    /** Get the full mock chrome.storage API */
    get api() {
        return {
            local: this.createArea('local'),
            sync: this.createArea('sync'),
            session: this.createArea('session'),
            onChanged: {
                addListener: (cb: StorageCallback) => { this.listeners.push(cb); },
                removeListener: (cb: StorageCallback) => {
                    const idx = this.listeners.indexOf(cb);
                    if (idx !== -1) this.listeners.splice(idx, 1);
                },
                hasListener: (cb: StorageCallback) => this.listeners.includes(cb),
            },
        };
    }

    /** Direct access to store data (for assertions) */
    getStore(area: string): Record<string, unknown> {
        return { ...this.stores[area] };
    }

    /** Reset all storage */
    reset(): void {
        this.stores = { local: {}, sync: {}, session: {} };
        this.listeners = [];
    }

    /** Seed storage with initial data */
    seed(area: string, data: Record<string, unknown>): void {
        this.stores[area] = { ...this.stores[area], ...data };
    }

    private createArea(areaName: string) {
        const store = () => this.stores[areaName];
        const notify = (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => {
            this.listeners.forEach((cb) => cb(changes, areaName));
        };

        return {
            get: (keys?: string | string[] | Record<string, unknown> | null): Promise<Record<string, unknown>> => {
                return new Promise((resolve) => {
                    if (keys === null || keys === undefined) {
                        resolve({ ...store() });
                        return;
                    }
                    if (typeof keys === 'string') {
                        const val = store()[keys];
                        resolve(val !== undefined ? { [keys]: val } : {});
                        return;
                    }
                    if (Array.isArray(keys)) {
                        const result: Record<string, unknown> = {};
                        keys.forEach((k) => { if (store()[k] !== undefined) result[k] = store()[k]; });
                        resolve(result);
                        return;
                    }
                    // Object with defaults
                    const result: Record<string, unknown> = {};
                    Object.entries(keys).forEach(([k, defaultVal]) => {
                        result[k] = store()[k] !== undefined ? store()[k] : defaultVal;
                    });
                    resolve(result);
                });
            },

            set: (items: Record<string, unknown>): Promise<void> => {
                return new Promise((resolve) => {
                    const changes: Record<string, { oldValue?: unknown; newValue?: unknown }> = {};
                    Object.entries(items).forEach(([key, value]) => {
                        changes[key] = { oldValue: store()[key], newValue: value };
                        this.stores[areaName][key] = value;
                    });
                    notify(changes);
                    resolve();
                });
            },

            remove: (keys: string | string[]): Promise<void> => {
                return new Promise((resolve) => {
                    const keyList = Array.isArray(keys) ? keys : [keys];
                    const changes: Record<string, { oldValue?: unknown; newValue?: unknown }> = {};
                    keyList.forEach((key) => {
                        if (store()[key] !== undefined) {
                            changes[key] = { oldValue: store()[key] };
                            delete this.stores[areaName][key];
                        }
                    });
                    notify(changes);
                    resolve();
                });
            },

            clear: (): Promise<void> => {
                return new Promise((resolve) => {
                    const changes: Record<string, { oldValue?: unknown }> = {};
                    Object.entries(store()).forEach(([key, value]) => {
                        changes[key] = { oldValue: value };
                    });
                    this.stores[areaName] = {};
                    notify(changes);
                    resolve();
                });
            },

            getBytesInUse: (keys?: string | string[] | null): Promise<number> => {
                return new Promise((resolve) => {
                    const data = store();
                    if (!keys) {
                        resolve(JSON.stringify(data).length);
                        return;
                    }
                    const keyList = Array.isArray(keys) ? keys : [keys];
                    const subset: Record<string, unknown> = {};
                    keyList.forEach((k) => { if (data[k] !== undefined) subset[k] = data[k]; });
                    resolve(JSON.stringify(subset).length);
                });
            },

            QUOTA_BYTES: areaName === 'sync' ? 102400 : 10485760,
        };
    }
}
