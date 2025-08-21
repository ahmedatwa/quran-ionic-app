import { defineStore } from "pinia";
import { ref, computed, onMounted, watch } from "vue";
import { shallowRef, nextTick } from "vue";
// stores
import { useTranslationsStore } from "@/stores/TranslationsStore";
import { useAudioStore } from "@/stores/AudioStore";
// axios
import { instance } from "@/axios";
import { makeChapterInfoUrl } from "@/axios/url";
// types
import type { Chapter, ChapterInfo } from "@/types/chapter";
import type { Loading } from "@/types/chapter";
import type { Verse, JSONDataPromise } from "@/types/verse";
import type { InfiniteScrollCustomEvent } from "@ionic/vue";
import type { Pagination } from "@/types/chapter";
// composables
import { useAlert } from "@/composables/useAlert";
import { useLocale } from "@/composables/useLocale";
import { useVerseTiming } from "@/composables/useVerseTiming";
// router
import { useRouter } from "vue-router";

export const useChapterStore = defineStore("chapter-store", () => {
  const { selectedTranslationId } = useTranslationsStore();
  const audioStore = useAudioStore();
  const { getLine } = useLocale();
  const { push } = useRouter();
  const { presentToast, presentLoading } = useAlert();
  const isLoading = ref<Loading>({ chapters: false, verses: false });
  const chaptersList = ref<Chapter[]>([]);
  const currentSortDir = ref("asc");
  const currentSort = ref("id");
  const selectedChapter = ref<Chapter | null>(null);
  const chapterInfo = ref<ChapterInfo | null>(null);
  const versesTotalRecords = ref(0);
  const allVerses = ref<Verse[]>([]);
  const TOTAL_CHAPTERS = ref(114);
  const searchVerseNumberValue = shallowRef("");
  const loadingVerses = shallowRef(false);
  const { verseTiming } = useVerseTiming();
  const currentVerseNumberFromTiming = computed(
    () => verseTiming.value?.verseNumber
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
   * @returns promise void chapter[]
   */
  const getAllChapters = (): Promise<Chapter[]> => {
    return new Promise((resolve, reject) => {
      try {
        import(`@jsonDataPath/chapters.json`).then((response) => {
          resolve(response.chapters);
        });
      } catch (error) {
        reject(error);
      }
    });
  };
  /**
   *
   * @param chapterId
   * @returns void
   */
  const getChapter = (chapterId: number | string) => {
    if (chaptersList.value) {
      return chaptersList.value.find(
        (chapter) => chapter.id === Number(chapterId)
      );
    }
  };

  /**
   *
   * @param slug
   * @returns void
   */
  const getChapterBySlug = (slug: string) => {
    if (chaptersList.value) {
      return chaptersList.value.find((chapter) => chapter.slug === slug);
    }
  };

  /**
   *
   * @param chapterId
   * @returns {string}
   */
  const getChapterNameByChapterId = (chapterId: number | string) => {
    const chapter = getChapter(Number(chapterId));
    if (chapter) {
      return {
        nameSimple: chapter.nameSimple,
        nameArabic: chapter.nameArabic,
        bismillahPre: chapter.bismillahPre,
      };
    }
  };

  /**
   * fetch verses and store in verses Ref
   * @param id
   * @returns
   */
  const getVerses = async (id: number) => {
    isLoading.value.verses = true;
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

    await loadVersesFromJson(id.toString())
      .then((res: JSONDataPromise) => {
        allVerses.value = res.verses;
        versesTotalRecords.value = res.pagination.total_records;
      })
      .catch(async (e) => {
        await presentToast({ message: String(e) });
      })
      .finally(() => {
        isLoading.value.verses = false;
      });
  };

  /**
   *  Load Verses from JSON file
   * @param fileName
   * @returns
   */
  const loadVersesFromJson = (fileName: string): Promise<JSONDataPromise> => {
    return new Promise((resolve) => {
      try {
        import(`@jsonDataPath/chapters/${fileName}.json`).then((response) => {
          resolve(response);
        });
      } catch (e) {
        console.warn(e);
      }
    });
  };

  /**
   * get total verses of chapter
   */
  const getTotalVersesOfChapter = async (chapterId: string) => {
    try {
      return (await loadVersesFromJson(chapterId)).pagination;
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
  onMounted(async () => {
    if (!chaptersList.value.length) {
      isLoading.value.chapters = true;
      await getAllChapters()
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
   * for header and audio modal data
   */
  const getFirstVerseHeaderData = computed(() => {
    if (getFirstVerseOfChapter.value) {
      return {
        left: selectedChapterName.value,
        right: {
          pageNumber: getFirstVerseOfChapter.value.page_number,
          hizbNumber: getFirstVerseOfChapter.value.hizb_number,
          juzNumber: getFirstVerseOfChapter.value.juz_number,
        },
      };
    }
  });

  /**
   *
   * @param verse
   * @returns {string}
   */
  const getChapterNameByFirstVerse = (verse: Verse) => {
    const [chapterId, verseNumber] = verse.verse_key.split(":");
    if (Number(verseNumber) === 1) {
      return getChapterNameByChapterId(chapterId);
    }
  };

  /**
   *
   * @param verseKey
   * @returns number
   */
  const getVerseByVerseKey = (verseKey: string | number) => {
    const split =
      typeof verseKey === "number"
        ? verseKey.toString().split(":")
        : verseKey.split(":");

    const chapter = getChapter(split[0]);
    if (chapter) {
      return chapter.verses?.find((v) => v.verse_number === parseInt(split[1]));
    }
  };

  /**
   * load more verses when playing audio
   * or when manual scrolling down
   *
   * @param ?infiniteScrollEvent
   * @returns void
   */
  const fetchMoreChapterVerses = async (
    infiniteScrollEvent?: InfiniteScrollCustomEvent
  ) => {
    if (infiniteScrollEvent) {
      if (selectedChapterVerses.value) {
        loadingVerses.value = true;
        currentPageEnd.value = Math.ceil(
          selectedChapterVerses.value?.length + perPage.value
        );
        const newVerses = allVerses.value.slice(
          selectedChapterVerses.value?.length,
          currentPageEnd.value
        );
        if (newVerses) {
          newVerses.forEach((v) =>
            selectedChapterVerses.value.push({
              ...v,
              bookmarked: false,
            })
          );
          setTimeout(() => {
            if (infiniteScrollEvent) infiniteScrollEvent.target.complete();
            loadingVerses.value = false;
          }, 200);
        }
      }
    } else {
      // look for number in chapter verses
      const toBFoundVerse: Verse | undefined =
        selectedChapterVerses.value?.find(
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
    }
  };

  /**
   * Fallbak for loading spinner
   * in case of any errors
   */
  watch(loadingVerses, async (loadingSpinnerState) => {
    if (loadingSpinnerState) {
      await presentLoading(false, {
        id: "loading-page-verses",
      });
    } else {
      await presentLoading(true, { id: "loading-page-verses" });
    }
  });

  /**
   * play next chapter and loaddata when needed
   * @param audioSrc
   * @return void
   */
  const playNextChapter = async (chapterId: number) => {
    if (chapterId) {
      loadingVerses.value = true;
      chapterId = chapterId >= TOTAL_CHAPTERS.value ? 1 : chapterId + 1;
      // get the audio files
      await audioStore
        .getAudio({ audioID: chapterId })
        .catch((e) => console.error(new Error(e)))
        .finally(() => {
          push({ path: `/chapter/${chapterId}`, replace: false });
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
    getFirstVerseHeaderData,
    selectedChapterBismillah,
    TOTAL_CHAPTERS,
    perPage,
    searchVerseNumberValue,
    loadingVerses,
    selectedChapterVerses,
    lastVerseInselectedChapterVerses,
    playNextChapter,
    getTotalVersesOfChapter,
    fetchMoreChapterVerses,
    getChapterNameByFirstVerse,
    validateSelectedChapterVerses,
    getVerseByVerseKey,
    getchapterInfo,
    getVerses,
    getChapterBySlug,
    getChapter,
    getChapterNameByChapterId,
  };
});
