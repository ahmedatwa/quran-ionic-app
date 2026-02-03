import { defineStore } from "pinia";
import { ref, computed, onBeforeMount, watch, shallowRef } from "vue";
// stores
import { useTranslationsStore } from "@/stores/TranslationsStore";
// types
import type { Juz, juzVersesByPageMap, JuzVerseMapping } from "@/types/juz";
import type { Verse } from "@/types/verse";
import type { InfiniteScrollCustomEvent } from "@ionic/vue";
// utils
import { _range } from "@/utils/number";
import { AllJuzsToChapters, loadJuzsJSONData } from "@/utils/juz";

export const useJuzStore = defineStore("juz-store", () => {
  const versesTotalRecords = ref(0);
  const totalJuzs = shallowRef(30);
  const { selectedTranslationId } = useTranslationsStore();
  const isLoading = ref(false);
  const juzList = ref<Juz[]>([]);
  const selectedJuz = ref<Juz | null>(null);
  const selectedJuzVerses = ref<Verse[]>([]);
  const allVerses = ref<Verse[]>([]);
  const selectedJuzId = computed(() => selectedJuz.value?.juz_number);
  const currentPageEnd = shallowRef();

  const perPage = ref(10);

  const getVerses = async (juzNumber: number) => {
    allVerses.value = [];
    versesTotalRecords.value = 0;
    await loadJuzsJSONData(juzNumber)
      .then((response) => {
        allVerses.value = response.verses;
        versesTotalRecords.value = response.pagination.total_records;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  onBeforeMount(async () => {
    if (!juzList.value.length) {
      isLoading.value = true;
      await AllJuzsToChapters()
        .then((res) => {
          juzList.value = res;
        })
        .catch((error) => {
          console.warn(error);
        })
        .finally(() => (isLoading.value = false));
    }
  });

  const juzVersesByChapterMap = computed((): juzVersesByPageMap | undefined => {
    if (selectedJuzVerses.value) {
      return selectedJuzVerses.value?.reduce(
        (result: any, currentValue: Verse) => {
          (result[currentValue.chapter_id] =
            result[currentValue.chapter_id] || []).push(currentValue);
          return result;
        },
        {}
      );
    }
  });

  watch(
    () => selectedTranslationId,
    async (resources) => {
      if (resources) {
        if (selectedJuz.value) {
          selectedJuz.value.verses = [];
          await getVerses(selectedJuz.value?.id);
        }
      }
    }
  );

  const getSelectedJuzChapters = computed(() => selectedJuz.value?.chapters);
  
  const getFirstVerseOfJuz = computed(() => {
    if (selectedJuzVerses.value) {
      return selectedJuzVerses.value[0];
    }
  });

  const getLastVerseOfJuz = computed(() => {
    if (selectedJuzVerses.value) {
      const verse = selectedJuzVerses.value?.slice(-1)[0];
      if (verse) {
        return verse.verse_number;
      }
    }
    return 0;
  });

  const getLastChapterOfSelectedJuz = computed(() => {
    if (selectedJuz.value?.chapters) {
      return selectedJuz.value?.chapters.slice(-1)[0];
    }
  });

  const getVersesRangeOfLastChapterInSelectedJuz = computed(() => {
    if (getLastChapterOfSelectedJuz.value) {
      return getLastChapterOfSelectedJuz.value.verses;
    }
  });
  /**
   * handle 2 locations 
   * calls coming from audio store on seek 
   * and from  infiniteScrollEvent event on manual scroll

   * @param infiniteScrollEvent 
   * @returns void
   */
  const fetchMoreJuzVerses = async (
    infiniteScrollEvent?: InfiniteScrollCustomEvent
  ) => {
    if (infiniteScrollEvent) {
      currentPageEnd.value = Math.ceil(
        selectedJuzVerses.value.length + perPage.value
      );
      allVerses.value
        ?.slice(selectedJuzVerses.value.length, currentPageEnd.value)
        .forEach((v) =>
          selectedJuzVerses.value?.push({ ...v, bookmarked: false })
        );
      setTimeout(() => {
        infiniteScrollEvent.target.complete();
      }, 200);
    } else {
    }
  };
  /**
   * play next chapter and loaddata when needed
   * @param audioSrc
   * @return void
   */
  const playNextJuz = async (juzNumber: number) => {
    if (juzNumber) {
      juzNumber = juzNumber > totalJuzs.value ? 1 : juzNumber + 1;
      // get the audio files
      const payload = getFirstVerseOfJuz;
      if (payload) {
        // await audioStore
        //   .getAudio({
        //     audioID: getFirstVerseOfJuz.value,
        //     verseKey: payload.verse_key,
        //   })
        //   .catch((e) => console.error(new Error(e)))
        //   .finally(() => {
        //     push({ path: `/juz/${juzNumber}`, replace: true });
        //     //loadingVerses.value = false;
        //   });
      }
    }
  };

  const selectedJuzVerseMapping = computed((): JuzVerseMapping | undefined => {
    if (selectedJuz.value) {
      return selectedJuz.value.verse_mapping;
    }
  });

  return {
    juzList,
    allVerses,
    selectedJuzId,
    selectedJuzVerses,
    versesTotalRecords,
    isLoading,
    selectedJuz,
    juzVersesByChapterMap,
    getFirstVerseOfJuz,
    getLastVerseOfJuz,
    getLastChapterOfSelectedJuz,
    getVersesRangeOfLastChapterInSelectedJuz,
    perPage,
    getSelectedJuzChapters,
    totalJuzs,
    selectedJuzVerseMapping,
    fetchMoreJuzVerses,
    playNextJuz,
    getVerses,
  };
});
