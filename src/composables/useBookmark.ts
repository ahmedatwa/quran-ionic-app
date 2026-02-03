import { computed, onMounted, ref } from "vue";
// composables
import { useAlert } from "@/composables/useAlert";
import { useStorage } from "@/composables/useStorage";
import { useLocale } from "@/composables/useLocale";
import { _removeFromArrayByKey } from "@/utils/array";
// types
import type { VerseBookmarkedItems, VerseBookmarkValue } from "@/types/verse";

// esposed for
const allBookmarks = ref<VerseBookmarkedItems[]>([]);

export const useBookmark = () => {
  const bookmarkedStorageKeys = ref<string[]>();
  const bookmarksBD = useStorage("__bookmarksDB");
  const { getLine } = useLocale();
  const { presentToast } = useAlert();

  const bookmarkedStorageLength = computed(
    () => bookmarkedStorageKeys.value?.length
  );

  const setBookmarked = async (args: {
    path: string;
    verse: VerseBookmarkValue;
  }) => {
    const key = `/v/${args.verse.verseKey}-p/${args.verse.pageNumber}`;
    if (bookmarkedStorageKeys.value) {
      const v = bookmarkedStorageKeys.value.find((k) => k === key);
      if (!v) {
        await _storeBookmark({ ...args });
      } else {
        await presentToast({
          id: "duplicate-verse-bookmark",
          message: getLine("quranReader.verseAlreadyBookmarked"),
          duration: 1500,
        });
      }
    } else {
      await _storeBookmark({ ...args });
    }
  };

  const _storeBookmark = async (args: {
    path: string;
    verse: VerseBookmarkValue;
  }) => {
    const key = `/v/${args.verse.verseKey}-p/${args.verse.pageNumber}`;
    const path = args.path + "/verse/" + args.verse.verseNumber;
    // just double check
    const isFound = allBookmarks.value.find((b) => b.key === key);
    if (!isFound) {
      allBookmarks.value?.push({
        key,
        value: { ...args.verse, path: path },
      });
      // store the key
      bookmarkedStorageKeys.value?.push(key);
      // store in DB
      await bookmarksBD
        .setStorage(key, { ...args.verse, path: path })
        .catch((e) => {
          console.warn(e);
        })
        .finally(async () => {
          await presentToast({
            id: "verse-bookmarked",
            color: "success",
            message: getLine("quranReader.verseBookmarked"),
            duration: 1500,
          });
        });
    }
  };

  const getAllStorageBookmarks = async () => {
    await bookmarksBD.storage.value?.forEach((v, k) => {
      if (!_isBookmarkFound(k)) {
        allBookmarks.value?.push({ key: k, value: v });
      }
    });
  };

  /**
   * remove bookmark from DB and Ref
   * @param key
   */
  const removeBookmark = async (key: string) => {
    allBookmarks.value = _removeFromArrayByKey(key);
    await bookmarksBD.removeItem(key).then(async () => {
      await presentToast({
        id: "verse-removed",
        color: "success",
        message: getLine("quranReader.verseBookmarkRemoved"),
        duration: 1000,
      });
    });
  };

  onMounted(async () => {
    const keys = await bookmarksBD.storageKeys();
    if (keys?.length) {
      bookmarkedStorageKeys.value = keys;
    }
  });

  /**
   * since it's not shared between
   * component have to manual check
   * before feeding allBookmarks array
   * @param key
   * @returns
   */
  const _isBookmarkFound = (key: string): boolean => {
    let found = allBookmarks.value.find((b) => b.key === key);
    return found ? true : false;
  };

  const _removeFromArrayByKey = (key: string): VerseBookmarkedItems[] => {
    return allBookmarks.value.filter((el) => el.key !== key);
  };

  return {
    allBookmarks,
    bookmarkedStorageLength,
    bookmarkedStorageKeys,
    getAllStorageBookmarks,
    removeBookmark,
    setBookmarked,
  };
};
