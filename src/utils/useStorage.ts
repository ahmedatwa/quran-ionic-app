import { onBeforeMount, ref, toValue } from "vue";
import { Drivers, Storage } from "@ionic/storage";
import CordovaSQLiteDriver from "localforage-cordovasqlitedriver";
import type { MaybeRefOrGetter, Ref } from "vue";

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
  const storage = ref<Storage | null>(null);

  const storageKeys = async () => {
    const keys = await storage.value?.keys();
    if (keys) return keys;
  };

  const removeItem = async (key: MaybeRefOrGetter | string) => {
    const toVal = toValue(key);
    await storage.value?.remove(toVal);
  };

  const getStorage = async (key: MaybeRefOrGetter | string) => {
    const toVal = toValue(key);
    const result = await storage.value?.get(toVal);
    if (result) return result;
  };

  const setStorage = async (
    key: string | number,
    value: MaybeRefOrGetter | string | object
  ) => {
    const toVal = toValue(value);

    await storage.value?.set(
      String(key),
      typeof toVal === "object" ? { ...toVal } : toVal
    );
  };

  const clearStorage = async () => {
    await storage.value?.clear();
  };

  const storageLength = async (): Promise<number | undefined> => {
    const len = await storage.value?.length();
    if (len) return len;
  };

  onBeforeMount(async () => {
    storage.value = new Storage({
      name: key,
      driverOrder: [
        CordovaSQLiteDriver._driver,
        Drivers.IndexedDB,
        Drivers.LocalStorage,
      ],
    });

    await storage.value.create();
    if (!storage.value.driver)
      await storage.value.defineDriver(CordovaSQLiteDriver);
  });

  const formatByteSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KiB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MiB";
    else return (bytes / 1073741824).toFixed(3) + " GiB";
  };

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
