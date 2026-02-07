import { encrypt, decrypt } from "./encryption";

export const secureLocalStorage = {
    setItem<T>(key: string, value: T): void {
        if (typeof window === "undefined") return;
        try {
            const encryptedValue = encrypt(JSON.stringify(value));
            localStorage.setItem(key, encryptedValue);
        } catch (error) {
            console.error(`Error saving ${key} to secure storage:`, error);
        }
    },

    getItem<T>(key: string, defaultValue: T | null = null): T | null {
        if (typeof window === "undefined") return defaultValue;
        try {
            const encryptedValue = localStorage.getItem(key);
            if (!encryptedValue) return defaultValue;

            const decryptedValue = decrypt(encryptedValue);
            return JSON.parse(decryptedValue) as T;
        } catch (error) {
            console.error(`Error retrieving ${key} from secure storage:`, error);
            // If decryption fails, maybe clear the corrupted data?
            // localStorage.removeItem(key); 
            return defaultValue;
        }
    },

    removeItem(key: string): void {
        if (typeof window === "undefined") return;
        localStorage.removeItem(key);
    }
};
