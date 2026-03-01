/**
 * Mock chrome.runtime API
 * Simulates messaging, install events, and extension context
 */

type MessageListener = (message: unknown, sender: unknown, sendResponse: (response?: unknown) => void) => boolean | void;

export class MockChromeRuntime {
    private messageListeners: MessageListener[] = [];
    private installListeners: Array<(details: { reason: string; previousVersion?: string }) => void> = [];
    private sentMessages: Array<{ message: unknown; response?: unknown }> = [];
    private extensionId = 'mock-extension-id-' + Math.random().toString(36).slice(2, 8);
    private manifestData: Record<string, unknown> = { version: '1.0.0', manifest_version: 3, name: 'Test Extension' };

    get api() {
        return {
            id: this.extensionId,

            getManifest: () => ({ ...this.manifestData }),

            getURL: (path: string) => `chrome-extension://${this.extensionId}/${path}`,

            sendMessage: (message: unknown): Promise<unknown> => {
                return new Promise((resolve) => {
                    const sender = { id: this.extensionId, tab: undefined };
                    let responded = false;
                    const sendResponse = (response?: unknown) => {
                        responded = true;
                        this.sentMessages.push({ message, response });
                        resolve(response);
                    };

                    for (const listener of this.messageListeners) {
                        const result = listener(message, sender, sendResponse);
                        if (result === true) return; // Async response
                    }

                    if (!responded) {
                        this.sentMessages.push({ message, response: undefined });
                        resolve(undefined);
                    }
                });
            },

            onMessage: {
                addListener: (cb: MessageListener) => { this.messageListeners.push(cb); },
                removeListener: (cb: MessageListener) => {
                    const idx = this.messageListeners.indexOf(cb);
                    if (idx !== -1) this.messageListeners.splice(idx, 1);
                },
                hasListener: (cb: MessageListener) => this.messageListeners.includes(cb),
            },

            onInstalled: {
                addListener: (cb: (details: { reason: string; previousVersion?: string }) => void) => {
                    this.installListeners.push(cb);
                },
                removeListener: () => { },
                hasListener: () => false,
            },

            lastError: null as { message: string } | null,
        };
    }

    /** Simulate extension install */
    simulateInstall(): void {
        this.installListeners.forEach((cb) => cb({ reason: 'install' }));
    }

    /** Simulate extension update */
    simulateUpdate(previousVersion: string = '0.9.0'): void {
        this.installListeners.forEach((cb) => cb({ reason: 'update', previousVersion }));
    }

    /** Get all sent messages (for assertions) */
    getSentMessages(): Array<{ message: unknown; response?: unknown }> {
        return [...this.sentMessages];
    }

    /** Set manifest data */
    setManifest(data: Record<string, unknown>): void {
        this.manifestData = { ...this.manifestData, ...data };
    }

    /** Reset */
    reset(): void {
        this.messageListeners = [];
        this.installListeners = [];
        this.sentMessages = [];
    }
}
