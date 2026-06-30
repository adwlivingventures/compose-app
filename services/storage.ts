import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * LocalStore handles absolute privacy by routing storage requirements locally.
 * Critical security pieces (like purchase receipt hashes) use Keychain-level
 * encryption via expo-secure-store. Performance and calendar states utilize
 * rapid-access local AsyncStorage.
 */
export const LocalStore = {
  /**
   * Encrypts and saves sensitive tokens/receipts (e.g. Purchase tokens) to iOS Keychain/Android Keystore.
   * Restricts accessibility to when the device is explicitly unlocked by the user.
   */
  async secureSave(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
      });
    } catch (e) {
      console.error('SecureStore write operation failed', e);
    }
  },

  /**
   * Retrieves secure credentials from the device Keychain.
   */
  async secureGet(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return null;
    }
  },

  /**
   * Stores progress arrays, habit parameters, and calendar tracking configurations locally.
   */
  async setItem(key: string, data: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error('AsyncStorage write operation failed', e);
    }
  },

  /**
   * Retrieves progress arrays or calendar tracking caches from AsyncStorage.
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
    } catch (e) {
      return null;
    }
  }
};
