/**
 * Mock chrome.tabs API
 * Virtual tab pool for testing tab management extensions
 */

interface MockTab {
    id: number;
    windowId: number;
    url: string;
    title: string;
    active: boolean;
    pinned: boolean;
    audible: boolean;
    discarded: boolean;
    groupId: number;
    index: number;
    status: string;
    favIconUrl: string;
}

export class MockChromeTabs {
    private tabs: MockTab[] = [];
    private nextId = 1;
    private listeners = {
        onCreated: [] as Array<(tab: MockTab) => void>,
        onRemoved: [] as Array<(tabId: number, info: { windowId: number }) => void>,
        onUpdated: [] as Array<(tabId: number, changes: Partial<MockTab>, tab: MockTab) => void>,
        onActivated: [] as Array<(info: { tabId: number; windowId: number }) => void>,
    };

    get api() {
        return {
            query: (queryInfo: Partial<MockTab>): Promise<MockTab[]> => {
                return Promise.resolve(this.tabs.filter((tab) => {
                    for (const [key, value] of Object.entries(queryInfo)) {
                        if (key === 'windowId' && value === -2) continue; // WINDOW_ID_CURRENT
                        if ((tab as Record<string, unknown>)[key] !== value) return false;
                    }
                    return true;
                }));
            },

            get: (tabId: number): Promise<MockTab> => {
                const tab = this.tabs.find((t) => t.id === tabId);
                if (!tab) return Promise.reject(new Error(`No tab with id: ${tabId}`));
                return Promise.resolve(tab);
            },

            create: (props: Partial<MockTab>): Promise<MockTab> => {
                const tab: MockTab = {
                    id: this.nextId++,
                    windowId: props.windowId || 1,
                    url: props.url || 'about:blank',
                    title: props.title || '',
                    active: props.active ?? false,
                    pinned: props.pinned ?? false,
                    audible: false,
                    discarded: false,
                    groupId: -1,
                    index: this.tabs.length,
                    status: 'complete',
                    favIconUrl: '',
                    ...props,
                };
                this.tabs.push(tab);
                this.listeners.onCreated.forEach((cb) => cb(tab));
                return Promise.resolve(tab);
            },

            remove: (tabIds: number | number[]): Promise<void> => {
                const ids = Array.isArray(tabIds) ? tabIds : [tabIds];
                ids.forEach((id) => {
                    const idx = this.tabs.findIndex((t) => t.id === id);
                    if (idx !== -1) {
                        const tab = this.tabs[idx];
                        this.tabs.splice(idx, 1);
                        this.listeners.onRemoved.forEach((cb) => cb(id, { windowId: tab.windowId }));
                    }
                });
                return Promise.resolve();
            },

            update: (tabId: number, props: Partial<MockTab>): Promise<MockTab> => {
                const tab = this.tabs.find((t) => t.id === tabId);
                if (!tab) return Promise.reject(new Error(`No tab with id: ${tabId}`));
                Object.assign(tab, props);
                this.listeners.onUpdated.forEach((cb) => cb(tabId, props, tab));
                return Promise.resolve(tab);
            },

            reload: (tabId: number): Promise<void> => {
                const tab = this.tabs.find((t) => t.id === tabId);
                if (tab) tab.discarded = false;
                return Promise.resolve();
            },

            discard: (tabId: number): Promise<void> => {
                const tab = this.tabs.find((t) => t.id === tabId);
                if (tab) tab.discarded = true;
                return Promise.resolve();
            },

            group: (options: { tabIds: number[]; groupId?: number }): Promise<number> => {
                const groupId = options.groupId || Math.floor(Math.random() * 10000);
                options.tabIds.forEach((id) => {
                    const tab = this.tabs.find((t) => t.id === id);
                    if (tab) tab.groupId = groupId;
                });
                return Promise.resolve(groupId);
            },

            ungroup: (tabIds: number[]): Promise<void> => {
                tabIds.forEach((id) => {
                    const tab = this.tabs.find((t) => t.id === id);
                    if (tab) tab.groupId = -1;
                });
                return Promise.resolve();
            },

            onCreated: { addListener: (cb: (tab: MockTab) => void) => { this.listeners.onCreated.push(cb); }, removeListener: () => { }, hasListener: () => false },
            onRemoved: { addListener: (cb: (id: number, info: { windowId: number }) => void) => { this.listeners.onRemoved.push(cb); }, removeListener: () => { }, hasListener: () => false },
            onUpdated: { addListener: (cb: (id: number, changes: Partial<MockTab>, tab: MockTab) => void) => { this.listeners.onUpdated.push(cb); }, removeListener: () => { }, hasListener: () => false },
            onActivated: { addListener: (cb: (info: { tabId: number; windowId: number }) => void) => { this.listeners.onActivated.push(cb); }, removeListener: () => { }, hasListener: () => false },
        };
    }

    /** Add tabs for test setup */
    addTab(props: Partial<MockTab> = {}): MockTab {
        const tab: MockTab = {
            id: this.nextId++, windowId: 1, url: 'https://example.com', title: 'Example',
            active: false, pinned: false, audible: false, discarded: false, groupId: -1,
            index: this.tabs.length, status: 'complete', favIconUrl: '', ...props,
        };
        this.tabs.push(tab);
        return tab;
    }

    /** Reset all tabs */
    reset(): void { this.tabs = []; this.nextId = 1; }

    /** Get current tab count */
    get count(): number { return this.tabs.length; }
}
