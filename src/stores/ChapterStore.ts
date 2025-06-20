import { defineStore } from "pinia";
import { ref, computed, onMounted, watch } from "vue";
// stores
import { useTranslationsStore } from "@/stores/TranslationsStore";
// axios
import { instance } from "@/axios";
import { makeChapterInfoUrl } from "@/axios/url";
// types
import type { Chapter, ChapterInfo } from "@/types/chapter";
import type { Loading } from "@/types/chapter";
import type { Verse, JSONDataPromise } from "@/types/verse";
// composables
import { useAlert } from "@/composables/useAlert";
import { useLocale } from "@/composables/useLocale";

export const useChapterStore = defineStore("chapter-store", () => {
  const translationsStore = useTranslationsStore();
  const { getLine } = useLocale();
  const { presentToast } = useAlert();
  const isLoading = ref<Loading>({ chapters: false, verses: false });
  const chaptersList = ref<Chapter[]>([]);
  const currentSortDir = ref("asc");
  const currentSort = ref("id");
  const searchValue = ref("");
  const selectedChapter = ref<Chapter | null>(null);
  const chapterInfo = ref<ChapterInfo | null>(null);
  const versesTotalRecords = ref(0);
  const verses = ref<Verse[] | null>(null);
  const TOTAL_CHAPTERS = ref(114);

  const selectedChapterId = computed(() => {
    if (selectedChapter.value) {
      return selectedChapter.value.id;
    }
    return 1;
  });

  const selectedChapterPagination = computed(() => {
    if (selectedChapter.value) {
      return selectedChapter.value.pagination;
    }
  });

  const chapters = computed((): Chapter[] | undefined => {
    if (chaptersList.value) {
      const searchableKeys = ["nameSimple", "nameArabic", "id"];
      return chaptersList.value.filter(
        (chapter: { nameSimple: string; nameArabic: string; id: number }) => {
          return searchableKeys.some((key) => {
            return chapter[key as keyof typeof chapter]
              .toString()
              .toLocaleLowerCase()
              .replace(/([\-\'])/, "")
              .includes(
                searchValue.value.toLocaleLowerCase().replace(/([\-\'])/, "")
              );
          });
        }
      );
    }
  });

  const getAllChapters = (): Promise<Chapter[]> => {
    return new Promise((resolve) => {
      try {
        import(`@jsonDataPath/chapters.json`).then((response) => {
          resolve(response.chapters);
        });
      } catch (error) {
        presentToast({ message: String(error) });
      }
    });
  };

  /**
   * get all chapters data from json file
   */
  const getChapters = async () => {
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
  };

  // /**
  //  *
  //  * @param chapterId
  //  * @returns
  //  */
  const getChapter = (chapterId: number | string) => {
    if (chaptersList.value) {
      return chaptersList.value.find(
        (chapter) => chapter.id === Number(chapterId)
      );
    }
  };

  const getChapterBySlug = (slug: string) => {
    if (chaptersList.value) {
      return chaptersList.value.find((chapter) => chapter.slug === slug);
    }
  };

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

  const getVerses = async (id: number, loading: boolean, page?: number) => {
    isLoading.value.verses = true;
    const chapter = chaptersList.value.find((s) => s.id === id);
    if (chapter?.verses?.length) return;
    await loadVersesFromJson(id.toString())
      .then((res: JSONDataPromise) => {
        verses.value = res.verses;
        versesTotalRecords.value = res.pagination.total_records;
      })
      .catch(async (e) => {
        await presentToast({ message: String(e) });
      })
      .finally(() => {
        isLoading.value.verses = false;
      });
  };

  // Load Verses from JSON file
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

  onMounted(async () => {
    if (!chaptersList.value.length) {
      await getChapters();
    }
  });

  const getchapterInfo = async (id: number, lang: string = "en") => {
    return await instance.get(makeChapterInfoUrl(id, lang));
  };

  // Add New Translations
  watch(
    () => translationsStore.selectedTranslationId,
    async (resources) => {
      if (resources) {
        if (selectedChapter.value) {
          selectedChapter.value.verses = [];
          await getVerses(selectedChapter.value?.id, true, 1);
        }
      }
    }
  );

  const getChapterName = (chapterId: number | string) => {
    if (chaptersList.value) {
      if (typeof chapterId === "string") chapterId = parseInt(chapterId);
      const found = chaptersList.value.find((c) => c.id === chapterId);
      if (found) {
        return {
          nameArabic: found.nameArabic,
          nameSimple: found.nameSimple,
          bismillahPre: found.bismillahPre,
        };
      }
    }
  };

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
  const selectedChapterVerses = computed(() => {
    if (selectedChapter.value) {
      return selectedChapter.value.verses;
    }
  });

  const versesKeyMap = computed(() => {
    if (selectedChapterVerses.value) {
      return selectedChapterVerses.value?.map((v) => v.verse_key);
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

  // initial header data to be sent onMounted
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

  const getChapterNameByFirstVerse = (verse: Verse) => {
    const [chapterId, verseNumber] = verse.verse_key.split(":");
    if (Number(verseNumber) === 1) {
      return getChapterNameByChapterId(chapterId);
    }
  };

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

  return {
    chapters,
    searchValue,
    selectedChapter,
    selectedChapterId,
    isLoading,
    verses,
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
    selectedChapterVerses,
    selectedChapterPagination,
    selectedChapterBismillah,
    TOTAL_CHAPTERS,
    getChapterNameByFirstVerse,
    getVerseByVerseKey,
    getChapterName,
    getchapterInfo,
    getVerses,
    getChapterBySlug,
    getChapters,
    getChapter,
    getChapterNameByChapterId,
  };
});
