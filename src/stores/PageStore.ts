import { defineStore } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
import { watch, shallowRef } from "vue";
// stores
import { useChapterStore } from "@/stores/ChapterStore";
import { useTranslationsStore } from "@/stores/TranslationsStore";
import { useAudioStore } from "@/stores/AudioStore";
// utils
import { _range } from "@/utils/number";
import { getAllPagesToChapters, DEFAULT_NUMBER_OF_PAGES } from "@/utils/pages";
import { getFirstVerseOfPage } from "@/utils/pages";
// composables
import { useAlert } from "@/composables/useAlert";
import { useVerseTiming } from "@/composables/useVerseTiming";

// types
import type { Page } from "@/types/page";
import type { JSONDataPromise, Verse } from "@/types/verse";

// router
import { useRouter } from "vue-router";

export const usePageStore = defineStore("page-store", () => {
  const { selectedTranslationId } = useTranslationsStore();

  const audioStore = useAudioStore();
  const { getChapterNameByChapterId } = useChapterStore();
  const { push } = useRouter();
  const { presentToast, presentLoading } = useAlert();
  const allVerses = ref<Verse[]>([]);
  const versesTotalRecords = ref(0);
  const isLoading = ref(false);
  const selectedPage = ref<Page | null>(null);
  const selectedPageVerses = ref<Verse[]>([]);
  const selectedPageId = computed(() => selectedPage.value?.pageNumber);
  const pagesList = ref<Page[]>([]);
  const loadingVerses = shallowRef(false);
  const perPage = shallowRef(20);
  //const currentPageEnd = shallowRef();
// const { verseTiming } = useVerseTiming();
  const searchVerseNumberValue = shallowRef("");
  // const currentVerseNumberFromTiming = computed(
  //   () => verseTiming.value?.verseNumber
  // );

  const getVerses = async (id: number) => {
   // loadingVerses.value = true;
    await loadPageDataFromJSON(id)
      .then((response) => {
        allVerses.value = response.verses;
        versesTotalRecords.value = response.pagination.total_records;
       // loadingVerses.value = false;
      })
      .catch(
        async (error) =>
          await presentToast({ id: "json-data-error", message: String(error) })
      )
  };

  const loadPageDataFromJSON = async (
    pageNumber: number
  ): Promise<JSONDataPromise> => {
    return new Promise((resolve, reject) => {
      try {
        import(`@jsonDataPath/pages/page-${pageNumber}.json`).then((response) =>
          resolve(response)
        );
      } catch (error) {
        reject(error);
      }
    });
  };

  onBeforeMount(async () => {
    if (!pagesList.value.length) {
      isLoading.value = true;
      await getAllPagesToChapters()
        .then((response) => {
          pagesList.value = response;
        })
        .catch(
          async (error) =>
            await presentToast({
              id: "error-pages-fetching",
              message: String(error),
            })
        )
        .finally(() => (isLoading.value = false));
    }
  });

  watch(
    () => selectedTranslationId,
    async (resources) => {
      if (resources) {
        if (selectedPage.value) {
          selectedPage.value.verses = [];
          await getVerses(selectedPage.value?.pageNumber);
        }
      }
    }
  );

  const getFirstVerseOfSeletedPage = computed(() => {
    if (selectedPageVerses.value) {
      return selectedPageVerses.value[0];
    }
  });

  const getLastVerseOfSeletedPage = computed(() => {
    if (selectedPageVerses.value) {
      const verse = selectedPageVerses.value.slice(-1)[0];
      if (verse) {
        return verse.verse_number;
      }
    }
    return 0;
  });

  const getInitialHeaderData = computed(() => {
    if (getFirstVerseOfSeletedPage.value) {
      return {
        left: getChapterNameByChapterId(
          getFirstVerseOfSeletedPage.value.chapter_id
        ),
        right: {
          pageNumber: getFirstVerseOfSeletedPage.value.page_number,
          hizbNumber: getFirstVerseOfSeletedPage.value.hizb_number,
          juzNumber: getFirstVerseOfSeletedPage.value.juz_number,
        },
      };
    }
  });

  // const fetchMorePagesVerses = async (
  //   infiniteScrollEvent?: InfiniteScrollCustomEvent
  // ) => {
  //   if (infiniteScrollEvent) {
  //     infiniteScrollEvent.target.complete();
  //     if (selectedPageVerses.value.length) {
  //       loadingVerses.value = true;
  //       console.log(loadingVerses.value);

  //       currentPageEnd.value = Math.ceil(
  //         selectedPageVerses.value.length + perPage.value
  //       );
  //       const verses = allVerses.value.slice(
  //         selectedPageVerses.value.length,
  //         currentPageEnd.value
  //       );
  //       if (verses) {
  //         verses.forEach((v) =>
  //           selectedPageVerses.value.push({ ...v, bookmarked: false })
  //         );
  //       }
  //     }
  //   } else {
  //     // look for number in chapter verses
  //     const toBFoundVerse: Verse | undefined = selectedPageVerses.value.find(
  //       (v) => v.verse_number === currentVerseNumberFromTiming.value
  //     );

  //     if (!toBFoundVerse) {
  //       const lastVerseInComputedVerses = selectedPageVerses.value.slice(-1)[0];
  //       if (
  //         lastVerseInComputedVerses?.verse_number &&
  //         currentVerseNumberFromTiming.value
  //       ) {
  //         const calc = Math.ceil(
  //           currentVerseNumberFromTiming.value -
  //             lastVerseInComputedVerses?.verse_number
  //         );
  //         if (selectedPageVerses.value.length) {
  //           currentPageEnd.value = Math.ceil(
  //             selectedPageVerses.value.length + calc
  //           );
  //           const verses = allVerses.value.slice(
  //             selectedPageVerses.value.length,
  //             currentPageEnd.value + 1
  //           );
  //           if (verses) {
  //             verses.forEach((v) =>
  //               selectedPageVerses.value.push({ ...v, bookmarked: false })
  //             );
  //             await nextTick(async () => {
  //               if (selectedPageVerses.value.length) {
  //                 if (selectedPageVerses.value.length >= calc)
  //                   loadingVerses.value = true;
  //               }
  //             });
  //           }
  //         }
  //       }
  //     } else {
  //       return;
  //     }
  //   }
  // };

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
  const playNextPage = async (pageNumber: number) => {
    if (pageNumber) {
      loadingVerses.value = true;
      pageNumber = pageNumber > DEFAULT_NUMBER_OF_PAGES ? 1 : pageNumber + 1;
      // get the audio files
      const payload = await getFirstVerseOfPage(pageNumber);
      if (payload) {
        await audioStore
          .getAudio({
            audioID: payload.chapter_id,
            verseKey: payload.verse_key,
          })
          .catch((e) => console.error(new Error(e)))
          .finally(() => {
            push({ path: `/page/${pageNumber}`, replace: false });
            loadingVerses.value = false;
          });
      }
    }
  };

  return {
    pagesList,
    allVerses,
    versesTotalRecords,
    isLoading,
    selectedPage,
    selectedPageId,
    getLastVerseOfSeletedPage,
    getFirstVerseOfSeletedPage,
    getInitialHeaderData,
    selectedPageVerses,
    loadingVerses,
    perPage,
    searchVerseNumberValue,
    //fetchMorePagesVerses,
    playNextPage,
    getVerses,
  };
});
