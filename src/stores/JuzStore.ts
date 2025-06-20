import { defineStore } from "pinia";
import { ref, computed, onBeforeMount, watch } from "vue";
// stores
import { useChapterStore } from "@/stores/ChapterStore";
import { useTranslationsStore } from "@/stores/TranslationsStore";
// types
import type { Juz, juzVersesByPageMap } from "@/types/juz";
import type { Verse, JSONDataPromise } from "@/types/verse";
// utils
import { _range } from "@/utils/number";
import { AllJuzsToChapters } from "@/utils/juz";
// composables
import { useStorage } from "@/composables/useStorage";
import { useAlert } from "@/composables/useAlert";

export const useJuzStore = defineStore("juz-store", () => {
  const verses = ref<Verse[]>();
  const versesTotalRecords = ref(0);
  const { selectedTranslation } = useTranslationsStore();
  const { chaptersList } = useChapterStore();
  const { getStorage } = useStorage("__juzDB");
  const { presentToast } = useAlert();
  const isLoading = ref(false);
  const juzList = ref<Juz[]>([]);
  const selectedJuz = ref<Juz | null>(null);
  const currentSortDir = ref("asc");
  const currentSort = ref("id");
  const searchValue = ref("");
  const perPage = ref(10);
  const selectedTranslationId = computed(() => {
    if (selectedTranslation?.id) {
      return String(selectedTranslation.id);
    }
    return "131";
  });

  const juzs = computed(() => {
    return juzList.value
      .filter((v) => {
        return v.juz_number.toLocaleString().includes(searchValue.value);
      })
      .sort((a: any, b: any) => {
        let modifier = 1;
        if (currentSortDir.value === "desc") modifier = -1;
        if (a[currentSort.value] < b[currentSort.value]) return -1 * modifier;
        if (a[currentSort.value] > b[currentSort.value]) return 1 * modifier;
        return 0;
      });
  });

  const getVerses = async (
    juzNumber: number,
    loading: boolean,
    page?: number,
    limit?: number
  ) => {
    isLoading.value = loading;
    page = page ? page : 1;
    limit = limit ? limit : perPage.value;
    const juz = juzList.value.find((s) => s.juz_number === juzNumber);

    await loadJuzsJSONData(juzNumber)
      .then((response) => {
        verses.value = response.verses;
        versesTotalRecords.value = response.pagination.total_records;
      })
      .catch(async (e) => {
        await presentToast({ message: String(e) });
      })
      .finally(() => {
        isLoading.value = false;
      });
    // Check for DB Storage to avoid the api call
    // if (juz) {
    //   const check = await isDBStorageData(juzNumber, juz);
    //   if (check) {
    //     isLoading.value = false;
    //     return;
    //   }
    // }

    // await instance
    //   .get(
    //     getVersesUrl(
    //       "by_juz",
    //       juzNumber,
    //       selectedTranslationId.value,
    //       page,
    //       limit
    //     )
    //   )
    //   .then((response) => {
    //     if (juz) {
    //       response.data.verses.forEach((verse: Verse) => {
    //         const verseFound = juz.verses?.find(
    //           (v) => v.verse_key === verse.verse_key
    //         );

    //         if (!verseFound) {
    //           juz.verses?.push({ ...verse, bookmarked: false });
    //         }
    //       });
    //       juz.pagination = response.data.pagination;
    //       if (selectedJuz.value?.pagination) {
    //         selectedJuz.value.pagination = response.data.pagination;
    //       }
    //     }
    //   })
    //   .catch(async (error) => {
    //     await presentToast({ message: String(error) });
    //   })
    //   .finally(() => {
    //     isLoading.value = false;
    //     // save chapter in DB
    //     setStorage(String(selectedJuz.value?.juz_number), {
    //       data: JSON.stringify(selectedJuz.value),
    //       length: selectedJuz.value?.verses?.length,
    //     });
    //   });
  };

  const loadJuzsJSONData = async (
    juzNumber: number
  ): Promise<JSONDataPromise> => {
    return new Promise((resolve, reject) => {
      try {
        import(`@jsonDataPath/juz/juz-${juzNumber}.json`).then((response) =>
          resolve(response.default)
        );
      } catch (error) {
        reject(error);
      }
    });
  };
  // const getJuzs = async () => {
  //   isLoading.value = true;
  //   await instance
  //     .get("/juzs")
  //     .then((response) => {
  //       const result: any[] = [
  //         ...new Map(
  //           response.data.juzs.map((item: Juz) => [item.juz_number, item])
  //         ).values(),
  //       ];

  //       if (result) {
  //         result.forEach((c: Juz) => {
  //           juzList.value?.push({
  //             ...c,
  //             verses: [],
  //           });
  //         });
  //       }
  //     })
  //     .catch(async (error) => {
  //       await presentToast({ message: String(error) });
  //     })
  //     .finally(() => {
  //       isLoading.value = false;
  //     });
  // };

  onBeforeMount(async () => {
    if (!juzList.value.length) {
      await AllJuzsToChapters().then((res) =>
        res.forEach((result) => juzList.value.push(result))
      );
    }
  });

  const juzVersesByChapterMap = computed((): juzVersesByPageMap | undefined => {
    if (selectedJuz.value) {
      if (selectedJuz.value.verses)
        return selectedJuz.value?.verses.reduce(
          (result: any, currentValue: Verse) => {
            (result[currentValue.chapter_id] =
              result[currentValue.chapter_id] || []).push(currentValue);
            return result;
          },
          {}
        );
    }
  });

  const sort = (s: string) => {
    if (s === currentSort.value) {
      currentSortDir.value = currentSortDir.value === "asc" ? "desc" : "asc";
    }
    currentSort.value = s;
  };

  watch(
    () => selectedTranslationId.value,
    async (resources) => {
      if (resources) {
        if (selectedJuz.value) {
          selectedJuz.value.verses = [];
          await getVerses(selectedJuz.value?.id, true, 1);
        }
      }
    }
  );

  const getChapterNameByVerseKey = (chapterId: number) => {
    if (chaptersList) {
      const found = chaptersList.find((c) => c.id === Number(chapterId));
      if (found) {
        return {
          ar: found.nameArabic,
          en: found.nameSimple,
          bismillah: found.bismillahPre,
        };
      }
    }
  };

  const getFirstVerseOfJuz = computed(() => {
    if (selectedJuz.value?.verses) {
      return selectedJuz.value?.verses[0];
    }
  });

  const getLastVerseOfJuz = computed(() => {
    if (selectedJuz.value) {
      const verse = selectedJuz.value.verses?.slice(-1)[0];
      if (verse) {
        return verse.verse_number;
      }
    }
    return 0;
  });

  // const isDBStorageData = async (chapterId: number, juz: Juz) => {
  //   const juzsDB: { data: string; length: number } = await getStorage(
  //     String(chapterId)
  //   );
  //   if (juzsDB) {
  //     // first fetch check onmounted

  //     // versecount === length
  //     if (juz.verses?.length === 0) {
  //       juz.verses = JSON.parse(juzsDB.data).verses;
  //       juz.pagination = JSON.parse(juzsDB.data).pagination;
  //       selectedJuz.value = juz;
  //       return true;
  //     } else if (juz.verses?.length) {
  //       if (juzsDB.length > juz.verses.length) {
  //         juz.verses = JSON.parse(juzsDB.data).verses;
  //         juz.pagination = JSON.parse(juzsDB.data).pagination;
  //         selectedJuz.value = juz;
  //         return true;
  //       }
  //     } else if (juzsDB.length === juz.verses_count) {
  //       juz.verses = JSON.parse(juzsDB.data).verses;
  //       juz.pagination = JSON.parse(juzsDB.data).pagination;
  //       selectedJuz.value = juz;
  //       return true;
  //     }
  //   }

  //   return false;
  // };

  return {
    verses,
    versesTotalRecords,
    isLoading,
    juzs,
    searchValue,
    selectedJuz,
    juzList,
    juzVersesByChapterMap,
    currentSort,
    currentSortDir,
    getFirstVerseOfJuz,
    getLastVerseOfJuz,
    getChapterNameByVerseKey,
    //getJuzs,
    sort,
    getVerses,
  };
});
