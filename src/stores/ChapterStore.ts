import { defineStore } from "pinia";
import { ref, computed, onMounted, watch } from "vue";

// stores
import { useTranslationsStore } from "@/stores/TranslationsStore";
// axios
import { instance } from "@/axios";
import { getVersesUrl, makeChapterInfoUrl } from "@/axios/url";
// types
import type { Chapter, ChapterInfo } from "@/types/chapter";
import type { Loading } from "@/types/chapter";
import type { Verse } from "@/types/verse";
// utils
import { useLocale } from "@/utils/useLocale";
import { useStorage } from "@/utils/useStorage";
import { useAlert } from "@/utils/useAlert";

export const useChapterStore = defineStore("chapter-store", () => {
  const translationsStore = useTranslationsStore();
  const { getStorage, setStorage } = useStorage("__chaptersDB");
  const TOTAL_CHAPTERS = ref(114);
  const { getLine } = useLocale();
  const { presentToast } = useAlert();

  const isLoading = ref<Loading>({ chapters: false, verses: false });
  const chaptersList = ref<Chapter[]>([]);
  const currentSortDir = ref("asc");
  const currentSort = ref("id");
  const searchValue = ref("");
  const selectedChapter = ref<Chapter | null>(null);
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

  const chapterInfo = ref<ChapterInfo | null>(null);
  const perPage = ref(15);

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
    return new Promise((resolve, reject) => {
      try {
        import("@/json/chapters.json").then((response) => {
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

  /**
   *
   * @param chapterId
   * @returns
   */
  const getChapter = (chapterId: number | string) => {
    if (chaptersList.value) {
      return chaptersList.value.find((chapter) => chapter.id === chapterId);
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

  const getVerses = async (
    id: number,
    loading: boolean,
    page?: number,
    limit?: number
  ) => {
    isLoading.value.verses = loading;
    page = page ? page : 1;
    limit = limit ? limit : perPage.value;
    isLoading.value.length = perPage.value;
    const chapter = chaptersList.value.find((s) => s.id === id);
    // Check for DB Storage to avoid the api call
    if (chapter) {
      const check = await isDBStorageData(id, chapter);
      if (check) {        
        isLoading.value.verses = false;
        return;
      }
    }
    
    await instance
      .get(
        getVersesUrl(
          "by_chapter",
          id,
          Number(translationsStore.selectedTranslationId),
          page,
          limit
        )
      )
      .then((response) => {
        if (chapter) {
          response.data.verses.forEach((verse: Verse) => {
            const verseFound = chapter.verses?.find(
              (v) => v.verse_key === verse.verse_key
            );

            if (!verseFound) {
              chapter.verses?.push({ ...verse, bookmarked: false });
            }
          });

          chapter.pagination = response.data.pagination;
          if (selectedChapter.value?.id === chapter.id) {
            selectedChapter.value.pagination = chapter.pagination;
            selectedChapter.value.verses = chapter.verses;
          }
        }
      })
      .catch(async (error) => {
        await presentToast({ message: String(error) });
      })
      .finally(() => {
        isLoading.value.verses = false;
        // save chapter in DB
        const id =
          selectedChapter.value?.id +
          "-" +
          translationsStore.selectedTranslationId;
        setStorage(id, {
          data: JSON.stringify(selectedChapter.value),
          length: selectedChapter.value?.verses?.length,
        });
      });
  };

  const getVerseByKey = async (id: number, verseKey: string) => {
    if (!verseKey || !id) return;
    isLoading.value.verses = true;
    isLoading.value.length = 1;
    await instance
      .get(
        getVersesUrl(
          "by_key",
          verseKey,
          Number(translationsStore.selectedTranslationId)
        )
      )
      .then((response) => {
        const chapter = chaptersList.value.find((s) => s.id === id);
        if (chapter) {
          const verseFound = chapter.verses?.find(
            (v) => v.verse_key === verseKey
          );
          if (!verseFound) {
            chapter.verses?.push({ ...response.data.verse, bookmarked: false });
          }
        }
      })
      .catch(async (error) => {
        await presentToast({ message: String(error) });
      })
      .finally(() => {
        isLoading.value.verses = false;
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

  const getVerseByVerseKey = (verseKey: string) => {
    const split = verseKey.split(":");
    const chapter = getChapter(Number(split[0]));
    if (chapter) {
      return chapter.verses?.find((v) => v.verse_number === Number(split[1]));
    }
  };

  const isDBStorageData = async (chapterId: number, chapter: Chapter) => {
    const id = chapterId + "-" + translationsStore.selectedTranslationId;    
    const chaptersDB: { data: string; length: number } = await getStorage(id);
  
    if (chaptersDB) {
      console.log(JSON.parse(chaptersDB.data));
      const parsedData = JSON.parse(chaptersDB.data) 
      chapter.verses = parsedData.verses;
      chapter.pagination = parsedData.pagination;
      selectedChapter.value = chapter;
      return true;
      // versecount === length
      // if (chapter.verses?.length === 0) {
      //   chapter.verses = JSON.parse(chaptersDB.data).verses;
      //   chapter.pagination = JSON.parse(chaptersDB.data).pagination;
      //   selectedChapter.value = chapter;
      //   return true;
      // } else if (chapter.verses?.length) {
      //   if (chaptersDB.length > chapter.verses.length) {
      //     chapter.verses = JSON.parse(chaptersDB.data).verses;
      //     chapter.pagination = JSON.parse(chaptersDB.data).pagination;
      //     selectedChapter.value = chapter;
      //     return true;
      //   }
      // } else if (chaptersDB.length === chapter.versesCount) {
      //   chapter.verses = JSON.parse(chaptersDB.data).verses;
      //   chapter.pagination = JSON.parse(chaptersDB.data).pagination;
      //   selectedChapter.value = chapter;
      //   return true;
      // }
    }

    return false;
  };

  return {
    chapters,
    searchValue,
    selectedChapter,
    selectedChapterId,
    isLoading,
    perPage,
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
    TOTAL_CHAPTERS,
    selectedChapterPagination,
    selectedChapterBismillah,
    getChapterNameByFirstVerse,
    getVerseByVerseKey,
    getChapterName,
    getchapterInfo,
    getVerses,
    getChapterBySlug,
    getVerseByKey,
    getChapters,
    getChapter,
    getChapterNameByChapterId,
  };
});
