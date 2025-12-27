
const ENCRYPTION_KEY = "sheryians-app-secure-storage-key";

export function encrypt(data: string): string {
    if (!data) return "";

    try {
        const encrypted = Array.from(data).map((char, i) => {
            const keyChar = ENCRYPTION_KEY[i % ENCRYPTION_KEY.length];
            return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
        }).join('');

        return btoa(encrypted);
    } catch (error) {
        console.error("Encryption failed:", error);
        return "";
    }
}

export function decrypt(encryptedData: string): string {
    if (!encryptedData) return "";

    try {
        const decoded = atob(encryptedData);

        const decrypted = Array.from(decoded).map((char, i) => {
            const keyChar = ENCRYPTION_KEY[i % ENCRYPTION_KEY.length];
            return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
        }).join('');

        return decrypted;
    } catch (error) {
        console.error("Decryption failed:", error);
        return "";
    }
}

export const secureLocalStorage = {
    setItem<T>(key: string, value: T): void {
        const encryptedValue = encrypt(JSON.stringify(value));
        localStorage.setItem(key, encryptedValue);
    },

    getItem<T>(key: string, defaultValue: T | null = null): T | null {
        try {
            const encryptedValue = localStorage.getItem(key);
            if (!encryptedValue) return defaultValue;

            const decryptedValue = decrypt(encryptedValue);
            return JSON.parse(decryptedValue) as T;
        } catch (error) {
            console.error(`Error retrieving ${key} from secure storage:`, error);
            return defaultValue;
        }
    },

    removeItem(key: string): void {
        localStorage.removeItem(key);
    }
};