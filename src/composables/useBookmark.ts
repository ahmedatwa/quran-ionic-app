import { ref, toValue, watchEffect } from "vue";
// composables
import { useAlert } from "@/composables/useAlert";
import { useStorage } from "@/composables/useStorage";
import { useLocale } from "@/composables/useLocale";
// stores
import { useChapterStore } from "@/stores/ChapterStore";

// types
import type { ShallowRef } from "vue";
import type { Verse } from "@/types/verse";

export type BookmarkedItems = {
  key: string;
  value: {
    pageNumber: number;
    chapterName?: string;
    verseNumber: number;
    verseText: string;
  };
};

export const useBookmark = (bookmarkedVerse: ShallowRef<Verse> | null) => {
  const bookmarkedItems = ref<BookmarkedItems[]>([]);
  const { presentAlert } = useAlert();
  const { setStorage } = useStorage("__bookmarksDB");
  const { getLine } = useLocale();
  const { getChapterName } = useChapterStore();

  watchEffect(() => {
    if (bookmarkedVerse) {
      const bookmarkedVerseValue = toValue(bookmarkedVerse);
      setBookmarked(bookmarkedVerseValue);
    }
  });

  const setBookmarked = async (verse: Verse) => {
    const v = bookmarkedItems.value.find(({ key }) => {
      const vNumber = key.split("-").pop();
      return Number(vNumber) === verse.verse_number;
    });
    if (!v) {
      bookmarkedItems.value.push({
        key: `/page/${verse.page_number}-${verse.verse_number}`,
        value: {
          pageNumber: verse.page_number,
          verseNumber: verse.verse_number,
          verseText: verse.text_uthmani,
          chapterName: getChapterName(verse.chapter_id)?.nameSimple,
        },
      });
      bookmarkedItems.value.forEach(({ key, value }) => {
        setStorage(key, value);
      });

      await presentAlert({
        message: getLine("quranReader.verseBookmarked"),
      });
    } else {
      await presentAlert({
        message: getLine("quranReader.verseAlreadyBookmarked"),
      });
    }
  };

  return { setBookmarked };
};
