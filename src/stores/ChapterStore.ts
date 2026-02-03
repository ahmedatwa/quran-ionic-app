import { defineStore } from "pinia";
import { ref, computed, onBeforeMount, watch } from "vue";
import { shallowRef, nextTick } from "vue";
// stores
import { useTranslationsStore } from "@/stores/TranslationsStore";
import { useAudioStore } from "@/stores/AudioStore";
import { useVerseTimingStore } from "@/stores/VerseTimingStore";

// axios
import { instance } from "@/axios";
import { makeChapterInfoUrl } from "@/axios/url";
// types
import type {
  Chapter,
  ChapterInfo,
  ReturnChapterNameByChapterId,
} from "@/types/chapter";
import type { Loading } from "@/types/chapter";
import type { Verse, JSONVersesPromiseReturn } from "@/types/verse";
import type { InfiniteScrollCustomEvent } from "@ionic/vue";
// composables
import { useAlert } from "@/composables/useAlert";
import { useLocale } from "@/composables/useLocale";
// utils
import { jsonChapterVersesById, jsonAllChapters } from "@/utils/chapter";

export const useChapterStore = defineStore("chapter-store", () => {
  const { selectedTranslationId } = useTranslationsStore();
  const audioStore = useAudioStore();
  const { getLine } = useLocale();
  const { presentToast, presentLoading } = useAlert();

  const isLoading = ref<Loading>({ chapters: false, verses: false });
  const chaptersList = ref<Chapter[]>([]);
  const currentSortDir = ref("asc");
  const currentSort = ref("id");
  const selectedChapter = ref<Chapter | null>(null);
  const chapterInfo = ref<ChapterInfo | null>(null);
  const versesTotalRecords = ref(0);
  const allVerses = ref<Verse[]>([]);
  const totalChapters = ref(114);
  const searchVerseNumberValue = shallowRef("");
  const loadingVerses = shallowRef(false);
  const verseTimingStore = useVerseTimingStore();
  const currentVerseNumberFromTiming = computed(
    () => verseTimingStore.verseTiming?.verseNumber
  );
  const currentPageEnd = shallowRef();
  // default for total verses per page
  const perPage = shallowRef(20);
  const selectedChapterVerses = ref<Verse[]>([]);
  const lastVerseInselectedChapterVerses = computed(
    () => selectedChapterVerses.value?.slice(-1)[0]
  );
  const selectedChapterId = computed(() => {
    if (selectedChapter.value) {
      return selectedChapter.value.id;
    }
    return 1;
  });

  /**
   *
   * @param slug
   * @returns
   */
  const getChapterBySlug = (slug: string): Chapter | undefined => {
    if (chaptersList.value) {
      return chaptersList.value.find((c) => c.slug === slug);
    }
  };

  /**
   *
   * @param chapterId
   * @returns
   */
  const getChapterById = (chapterId: number | string): Chapter | undefined => {
    if (chaptersList.value) {
      return chaptersList.value.find((c) => c.id === Number(chapterId));
    }
  };

  /**
   *
   * @param chapterId
   * @returns {string}
   */

  const getChapterNameByChapterId = (
    chapterId: number | string
  ): ReturnChapterNameByChapterId | undefined => {
    const chapter = getChapterById(chapterId);
    if (chapter) {
      return {
        nameSimple: chapter.nameSimple,
        nameArabic: chapter.nameArabic,
        bismillahPre: chapter.bismillahPre,
      };
    }
  };

  /**
   *
   * @param chapterId
   * @returns
   */
  const getChapterVerseCount = (
    chapterId: string | number
  ): number | undefined => {
    return getChapterById(chapterId)?.versesCount;
  };

  /**
   *
   * @param verse
   * @returns {string}
   */
  const getChapterNameByVerseKey = (
    verseKey: string
  ): ReturnChapterNameByChapterId | undefined => {
    const [chapterId, _verseNumber] = verseKey.split(":");
    return getChapterNameByChapterId(chapterId);
  };

  /**
   * fetch verses and store in verses Ref
   * @param id
   * @returns
   */
  const getVerses = async (id: number) => {
    const checkChapter = validateSelectedChapterVerses(id);

    if (checkChapter) {
      if (checkChapter.isValidVerseLength) {
        if (checkChapter.chapterData) {
          if (checkChapter.chapterData.verses)
            allVerses.value = checkChapter.chapterData.verses;
          versesTotalRecords.value = checkChapter.chapterData.versesCount;
        }
        return;
      }
    }

    allVerses.value = [];
    versesTotalRecords.value = 0;
    await jsonChapterVersesById(id.toString())
      .then((res: JSONVersesPromiseReturn) => {
        allVerses.value = res.verses;
        versesTotalRecords.value = res.pagination.total_records;
      })
      .catch(async (e) => {
        await presentToast({ message: String(e) });
      })
      .finally(() => {
        //isLoading.value.verses = false;
      });
  };

  /**
   * get total verses of chapter
   */
  const getTotalVersesOfChapter = async (chapterId: string) => {
    try {
      return (await jsonChapterVersesById(chapterId)).pagination;
    } catch (e) {
      console.warn(e);
    }
  };
  /**
   * validate found chapter verses length
   * if versesCount matches the selected verses length
   * return false
   */

  const validateSelectedChapterVerses = (
    id: number,
    len?: number
  ):
    | { isValidVerseLength: boolean; chapterData: Chapter | null }
    | undefined => {
    const found = chaptersList.value.find((s) => s.id === id);
    if (found) {
      if (!len) len = found.versesCount;
      if (found.verses) {
        if (found.verses.length > 0 && found.verses.length <= length) {
          return { isValidVerseLength: true, chapterData: found };
        } else {
          return { isValidVerseLength: false, chapterData: found };
        }
      }
    }
  };
  /**
   * prepare for first run
   */
  onBeforeMount(async () => {
    if (!chaptersList.value.length) {
      isLoading.value.chapters = true;
      await jsonAllChapters()
        .then((response) => {
          response.forEach((chapter: Chapter) => {
            chaptersList.value?.push({
              ...chapter,
              verses: [],
              pagination: null,
              chapterInfo: null,
              audioFile: null,
            });
          });
        })
        .catch(async (error) => {
          await presentToast({ message: String(error) });
        })
        .finally(() => {
          isLoading.value.chapters = false;
        });
    }
  });

  const getchapterInfo = async (id: number, lang: string = "en") => {
    return await instance.get(makeChapterInfoUrl(id, lang));
  };

  /**
   * lisen to translations changes
   */
  watch(
    () => selectedTranslationId,
    async (resources) => {
      if (resources) {
        if (selectedChapter.value) {
          selectedChapter.value.verses = [];
          await getVerses(selectedChapter.value?.id);
        }
      }
    }
  );

  const selectedChapterName = computed(() => {
    return {
      nameSimple: selectedChapter.value?.nameSimple,
      nameArabic: selectedChapter.value?.nameArabic,
    };
  });

  const selectedChapterBismillah = computed(() => {
    return selectedChapter.value?.bismillahPre
      ? getLine("quranReader.textBismillah")
      : "";
  });

  // selected chapter verses

  const versesKeyMap = computed(() => {
    if (selectedChapter.value?.verses) {
      return selectedChapter.value?.verses?.map((v) => v.verse_key);
    }
  });

  // first verse in chapter
  const getFirstVerseOfChapter = computed(() => {
    if (selectedChapterVerses.value) {
      return selectedChapterVerses.value[0];
    }
  });

  // last verse in chapter verses length
  const getLastVerseNumberOfChapter = computed(() => {
    if (selectedChapterVerses.value) {
      const verse = selectedChapterVerses.value.slice(-1)[0];
      if (verse) {
        return verse.verse_number;
      }
    }
    return 0;
  });

  /**
   *
   * @param verseKey
   * @returns number
   */
  const getVerseByVerseKey = (verseKey: string) => {
    return allVerses.value.find((v) => v.verse_key === verseKey);
  };

  /**
   * handle 2 locations
   * calls coming from audio store on seek
   * and from  infiniteScrollEvent event on manual scroll
   *
   * @param ?infiniteScrollEvent
   * @returns void
   */
  const fetchMoreChapterVerses = async () => {
    loadingVerses.value = true;
    // look for number in chapter verses
    const toBFoundVerse: Verse | undefined = selectedChapterVerses.value?.find(
      (v) => v.verse_number === currentVerseNumberFromTiming.value
    );

    if (!toBFoundVerse) {
      if (
        lastVerseInselectedChapterVerses.value?.verse_number &&
        currentVerseNumberFromTiming.value
      ) {
        const calc = Math.ceil(
          currentVerseNumberFromTiming.value -
            lastVerseInselectedChapterVerses.value?.verse_number
        );
        if (selectedChapterVerses.value) {
          currentPageEnd.value = Math.ceil(
            selectedChapterVerses.value?.length + calc
          );
          const verses = selectedChapter.value?.verses?.slice(
            selectedChapterVerses.value?.length,
            currentPageEnd.value + 1
          );
          if (verses) {
            verses.forEach((v) =>
              selectedChapter.value?.verses?.push({
                ...v,
                bookmarked: false,
              })
            );
            await nextTick(async () => {
              if (selectedChapterVerses.value) {
                if (selectedChapterVerses.value?.length >= calc)
                  loadingVerses.value = false;
              }
            });
          }
        }
      }
    } else {
      return;
    }
  };

  const infiniteScrollMoreVerses = () => {
    loadingVerses.value = true;
    if (selectedChapterVerses.value) {
      currentPageEnd.value = Math.ceil(
        selectedChapterVerses.value?.length + perPage.value
      );

      allVerses.value
        .slice(selectedChapterVerses.value?.length, currentPageEnd.value)
        .forEach((v) =>
          selectedChapterVerses.value.push({
            ...v,
            bookmarked: false,
          })
        );
      setTimeout(() => (loadingVerses.value = false), 200);
    }
  };

  const isBismillahPre = (chapterId: string | number) => {
    const name = getChapterNameByChapterId(Number(chapterId));
    if (name) {
      return name.bismillahPre ? getLine("quranReader.textBismillah") : "";
    }
  };

  const getChapterArabicName = (chapterId: string | number) => {
    const name = getChapterNameByChapterId(Number(chapterId));
    if (name) {
      return name.nameArabic;
    }
  };

  /**
   * play next chapter and loaddata when needed
   * @param audioSrc
   * @return void
   */
  const playNextChapter = async (chapterId: number) => {
    if (chapterId) {
      loadingVerses.value = true;
      chapterId = chapterId >= totalChapters.value ? 1 : chapterId + 1;

      await presentLoading({
        id: `playback-ended-${chapterId}`,
        message: `Playing chapter ${Number(chapterId)} in 2s`,
        duration: 2000,
      });

      // get the audio files
      await audioStore
        .getAudio({ audioID: chapterId, audioSrc: "chapter" })
        .finally(() => {
          loadingVerses.value = false;
        });
    }
  };

  return {
    selectedChapter,
    selectedChapterId,
    isLoading,
    allVerses,
    versesTotalRecords,
    currentSort,
    currentSortDir,
    chapterInfo,
    chaptersList,
    versesKeyMap,
    selectedChapterName,
    getFirstVerseOfChapter,
    getLastVerseNumberOfChapter,
    selectedChapterBismillah,
    totalChapters,
    perPage,
    searchVerseNumberValue,
    loadingVerses,
    selectedChapterVerses,
    lastVerseInselectedChapterVerses,
    isBismillahPre,
    infiniteScrollMoreVerses,
    getChapterArabicName,
    playNextChapter,
    getChapterBySlug,
    fetchMoreChapterVerses,
    getChapterNameByChapterId,
    validateSelectedChapterVerses,
    getVerseByVerseKey,
    getchapterInfo,
    getVerses,
    getTotalVersesOfChapter,
    getChapterById,
    getChapterVerseCount,
    getChapterNameByVerseKey,
  };
});
