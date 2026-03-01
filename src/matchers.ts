/**
 * Custom Jest Matchers for Chrome Extension Testing
 */

export function toHaveStorageValue(
    received: Record<string, unknown>,
    key: string,
    expectedValue: unknown
): { pass: boolean; message: () => string } {
    const actual = received[key];
    const pass = JSON.stringify(actual) === JSON.stringify(expectedValue);
    return {
        pass,
        message: () => pass
            ? `Expected storage key "${key}" to NOT have value ${JSON.stringify(expectedValue)}`
            : `Expected storage key "${key}" to have value ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(actual)}`,
    };
}

export function toHaveSentMessage(
    received: Array<{ message: unknown }>,
    expectedMessage: unknown
): { pass: boolean; message: () => string } {
    const pass = received.some(
        (entry) => JSON.stringify(entry.message) === JSON.stringify(expectedMessage)
    );
    return {
        pass,
        message: () => pass
            ? `Expected messages to NOT include ${JSON.stringify(expectedMessage)}`
            : `Expected messages to include ${JSON.stringify(expectedMessage)}, but it was not found.\nReceived messages: ${JSON.stringify(received.map((e) => e.message), null, 2)}`,
    };
}

/** Register all custom matchers with Jest */
export function registerMatchers(): void {
    if (typeof expect !== 'undefined' && expect.extend) {
        expect.extend({ toHaveStorageValue, toHaveSentMessage });
    }
}
