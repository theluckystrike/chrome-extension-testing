/**
 * Mock chrome.notifications API
 */
export class MockChromeNotifications {
    private notifications: Map<string, { title: string; message: string; type: string }> = new Map();
    private listeners = { onClicked: [] as Array<(id: string) => void>, onClosed: [] as Array<(id: string) => void> };

    get api() {
        return {
            create: (id: string | undefined, options: { type?: string; title: string; message: string; iconUrl?: string }): Promise<string> => {
                const nId = id || `notif-${Date.now()}`;
                this.notifications.set(nId, { title: options.title, message: options.message, type: options.type || 'basic' });
                return Promise.resolve(nId);
            },
            clear: (id: string): Promise<boolean> => { const had = this.notifications.has(id); this.notifications.delete(id); return Promise.resolve(had); },
            getAll: (): Promise<Record<string, boolean>> => {
                const result: Record<string, boolean> = {};
                this.notifications.forEach((_, k) => { result[k] = true; });
                return Promise.resolve(result);
            },
            onClicked: { addListener: (cb: (id: string) => void) => { this.listeners.onClicked.push(cb); }, removeListener: () => { }, hasListener: () => false },
            onClosed: { addListener: (cb: (id: string) => void) => { this.listeners.onClosed.push(cb); }, removeListener: () => { }, hasListener: () => false },
        };
    }

    simulateClick(id: string): void { this.listeners.onClicked.forEach((cb) => cb(id)); }
    simulateClose(id: string): void { this.listeners.onClosed.forEach((cb) => cb(id)); }
    getNotification(id: string) { return this.notifications.get(id); }
    reset(): void { this.notifications.clear(); this.listeners = { onClicked: [], onClosed: [] }; }
}
