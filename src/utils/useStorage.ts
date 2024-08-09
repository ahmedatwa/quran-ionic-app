import { onBeforeMount, ref, toValue, watchEffect } from "vue";
import { Drivers, Storage } from "@ionic/storage";
import CordovaSQLiteDriver from "localforage-cordovasqlitedriver";
import type { ComputedRef, Ref } from "vue";

export type BookmarkedItems = {
  key: string;
  value: {
    pageNumber: number;
    chapterName?: string;
    verseNumber: number;
    verseText: string;
  };
};
const bookmarkedItems = ref<BookmarkedItems[]>([]);

export const useStorage = (key: string) => {
  const storage = new Storage({
    name: key,
    driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
  });

  const storageKeys = async () => {
    const keys = await storage.keys();
    if (keys) return keys;
  };

  const removeItem = async (key: string) => {
    await storage.remove(key);
  };

  const getStorage = async (key: string | number) => {
    const result = await storage.get(String(key));
    if (result) return result;
  };

  const setStorage = async (
    key: string | number,
    value: Ref | ComputedRef | string | object
  ) => {
    const items = toValue(value);

    await storage.set(
      String(key),
      typeof items === "object" ? { ...items } : items
    );
  };

  const clearStorage = async () => {
    await storage.clear();
  };

  const storageLength = async () => {
    const len = await storage.length();
    if (len) return len;
  };

  onBeforeMount(async () => {
    await storage.create();
    if (!storage.defineDriver(CordovaSQLiteDriver)) {
      await storage.defineDriver(CordovaSQLiteDriver);
    }
  });

  return {
    storage,
    bookmarkedItems,
    getStorage,
    setStorage,
    removeItem,
    clearStorage,
    storageKeys,
    storageLength,
  };
};
