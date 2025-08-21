import { defineStore } from "pinia";
import { ref, computed, onBeforeMount, watch } from "vue";
// stores
import { useTranslationsStore } from "@/stores/TranslationsStore";
// types
import type { Juz, juzVersesByPageMap } from "@/types/juz";
import type { Verse, JSONDataPromise } from "@/types/verse";
// utils
import { _range } from "@/utils/number";
import { AllJuzsToChapters } from "@/utils/juz";
// composables
import { useAlert } from "@/composables/useAlert";

export const useJuzStore = defineStore("juz-store", () => {
  const verses = ref<Verse[]>();
  const versesTotalRecords = ref(0);
  const { selectedTranslationId } = useTranslationsStore();
  const { presentToast } = useAlert();
  const isLoading = ref(false);
  const juzList = ref<Juz[]>([]);
  const selectedJuz = ref<Juz | null>(null);
  const perPage = ref(10);

  const getVerses = async (
    juzNumber: number,
    loading: boolean,
    page?: number,
    limit?: number
  ) => {
    isLoading.value = loading;
    page = page ? page : 1;
    limit = limit ? limit : perPage.value;
    const juz = juzList.value?.find((s) => s.juz_number === juzNumber);

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

  watch(
    () => selectedTranslationId,
    async (resources) => {
      if (resources) {
        if (selectedJuz.value) {
          selectedJuz.value.verses = [];
          await getVerses(selectedJuz.value?.id, true, 1);
        }
      }
    }
  );

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

  const fetchMoreJuzVerses = () => {};
  /**
   * play next chapter and loaddata when needed
   * @param audioSrc
   * @return void
   */
  const playNextJuz = async () => {
    if (pageNumber) {
      pageNumber = pageNumber >= DEFAULT_NUMBER_OF_PAGES ? 1 : pageNumber + 1;
      // get the audio files
      await getAudio(payload).then(() => {
        replace(`/page/${pageNumber}`);
      });
    }
  };

  return {
    juzList,
    verses,
    versesTotalRecords,
    isLoading,
    selectedJuz,
    juzVersesByChapterMap,
    getFirstVerseOfJuz,
    getLastVerseOfJuz,
    playNextJuz,
    fetchMoreJuzVerses,
    getVerses,
  };
});
