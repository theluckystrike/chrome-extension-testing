/**
 * Mock chrome.alarms API
 * Timer simulation for testing alarm-based extensions
 */

interface Alarm { name: string; scheduledTime: number; periodInMinutes?: number; }

export class MockChromeAlarms {
    private alarms: Alarm[] = [];
    private listeners: Array<(alarm: Alarm) => void> = [];

    get api() {
        return {
            create: (name: string, alarmInfo: { delayInMinutes?: number; periodInMinutes?: number; when?: number }): Promise<void> => {
                const alarm: Alarm = {
                    name,
                    scheduledTime: alarmInfo.when || Date.now() + (alarmInfo.delayInMinutes || 1) * 60000,
                    periodInMinutes: alarmInfo.periodInMinutes,
                };
                this.alarms.push(alarm);
                return Promise.resolve();
            },
            get: (name: string): Promise<Alarm | undefined> => Promise.resolve(this.alarms.find((a) => a.name === name)),
            getAll: (): Promise<Alarm[]> => Promise.resolve([...this.alarms]),
            clear: (name: string): Promise<boolean> => {
                const idx = this.alarms.findIndex((a) => a.name === name);
                if (idx !== -1) { this.alarms.splice(idx, 1); return Promise.resolve(true); }
                return Promise.resolve(false);
            },
            clearAll: (): Promise<boolean> => { this.alarms = []; return Promise.resolve(true); },
            onAlarm: {
                addListener: (cb: (alarm: Alarm) => void) => { this.listeners.push(cb); },
                removeListener: () => { },
                hasListener: () => false,
            },
        };
    }

    /** Fire an alarm by name (for testing) */
    fireAlarm(name: string): void {
        const alarm = this.alarms.find((a) => a.name === name);
        if (alarm) this.listeners.forEach((cb) => cb(alarm));
    }

    /** Fire all alarms */
    fireAll(): void { this.alarms.forEach((alarm) => this.listeners.forEach((cb) => cb(alarm))); }

    reset(): void { this.alarms = []; this.listeners = []; }
}
