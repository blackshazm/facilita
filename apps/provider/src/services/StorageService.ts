import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  ACTIVE_ORDER: '@facilita/active_order',
  PROVIDER_PROFILE: '@facilita/provider_profile',
};

export const StorageService = {
  async saveActiveOrder(order: any) {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.ACTIVE_ORDER, JSON.stringify(order));
    } catch (e) {
      console.error('Failed to save order to cache', e);
    }
  },

  async getActiveOrder() {
    try {
      const data = await AsyncStorage.getItem(CACHE_KEYS.ACTIVE_ORDER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to read order from cache', e);
      return null;
    }
  },

  async saveProfile(profile: any) {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.PROVIDER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to cache', e);
    }
  },

  async getProfile() {
    try {
      const data = await AsyncStorage.getItem(CACHE_KEYS.PROVIDER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to read profile from cache', e);
      return null;
    }
  },

  async clearAll() {
    await AsyncStorage.clear();
  }
};
