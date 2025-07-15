import { defineStore } from "pinia";
import { computed, onBeforeMount, ref, watch } from "vue";
// stores
import { useChapterStore } from "@/stores/ChapterStore";
import { useTranslationsStore } from "@/stores/TranslationsStore";
// utils
import { _range } from "@/utils/number";
import { getAllPagesToChapters } from "@/utils/pages";
// composables
import { useAlert } from "@/composables/useAlert";
// types
import type { Page } from "@/types/page";
import type { JSONDataPromise, Verse } from "@/types/verse";

export const usePageStore = defineStore("page-store", () => {
  const { selectedTranslationId } = useTranslationsStore();
  const { getChapterNameByChapterId } = useChapterStore();
  const { presentToast } = useAlert();
  const verses = ref<Verse[]>();
  const versesTotalRecords = ref(0);
  const isLoading = ref(false);
  const selectedPage = ref<Page | null>(null);
  const selectedPageId = ref<number>();
  const pagesList = ref<Page[]>([]);

  const getVerses = async (id: number, loading: boolean) => {
    isLoading.value = loading;
    selectedPageId.value = id;
    const currentPage = pagesList.value?.find((p) => p.pageNumber === id);

    await loadPageDataFromJSON(id)
      .then((response) => {
        verses.value = response.verses;
        versesTotalRecords.value = response.pagination.total_records;
      })
      .catch(async (error) => await presentToast({ message: String(error) }))
      .finally(() => (isLoading.value = false));
    // await instance
    //   .get(
    //     getVersesUrl("by_page", id, selectedTranslationId.value, page, limit)
    //   )
    //   .then((response) => {
    //     if (currentPage) {
    //       response.data.verses.forEach((verse: Verse) => {
    //         const verseFound = currentPage.verses?.find(
    //           (v) => v.verse_key === verse.verse_key
    //         );

    //         if (!verseFound) {
    //           currentPage.verses?.push({ ...verse, bookmarked: false });
    //         }
    //       });

    //       currentPage.pagination = response.data.pagination;
    //       if (selectedPage.value?.pageNumber === currentPage.pageNumber) {
    //         if (selectedPage.value) {
    //           selectedPage.value.verses = currentPage.verses;
    //           selectedPage.value.pagination = currentPage.pagination;
    //         }
    //       }
    //     }
    //   })
    //   .catch(async (error) => {
    //     await presentToast({ message: String(error) });
    //   })
    //   .finally(() => {
    //     isLoading.value = false;
    //     // save chapter in DB
    //     setStorage(String(selectedPage.value?.pageNumber), {
    //       data: JSON.stringify(selectedPage.value),
    //       length: selectedPage.value?.verses?.length,
    //     });
    //   });
  };

  const loadPageDataFromJSON = async (
    pageNumber: number
  ): Promise<JSONDataPromise> => {
    return new Promise((resolve, reject) => {
      try {
        import(`@jsonDataPath/pages/page-${pageNumber}.json`).then((response) =>
          resolve(response.default)
        );
      } catch (error) {
        reject(error);
      }
    });
  };

  onBeforeMount(async () => {
    if (!pagesList.value.length) {
      isLoading.value = true;
      await getAllPagesToChapters().then((response) => {
          pagesList.value = response;
        })
        .catch(async (error) => await presentToast({ message: String(error) }))
        .finally(() => (isLoading.value = false));
    }
  });

  watch(
    () => selectedTranslationId,
    async (resources) => {
      if (resources) {
        if (selectedPage.value) {
          selectedPage.value.verses = [];
          await getVerses(selectedPage.value?.pageNumber, true);
        }
      }
    }
  );

  const getFirstVerseOfPage = computed(() => {
    if (selectedPage.value) {
      return selectedPage.value.verses[0];
    }
  });

  const getLastVerseOfPage = computed(() => {
    if (selectedPage.value) {
      return selectedPage.value.verses.slice(-1)[0];
    }
  });

  const getInitialHeaderData = computed(() => {
    if (getFirstVerseOfPage.value) {
      return {
        left: getChapterNameByChapterId(getFirstVerseOfPage.value.chapter_id),
        right: {
          pageNumber: getFirstVerseOfPage.value.page_number,
          hizbNumber: getFirstVerseOfPage.value.hizb_number,
          juzNumber: getFirstVerseOfPage.value.juz_number,
        },
      };
    }
  });

  return {
    pagesList,
    verses,
    versesTotalRecords,
    isLoading,
    selectedPage,
    selectedPageId,
    getLastVerseOfPage,
    getFirstVerseOfPage,
    getInitialHeaderData,
    getVerses,
  };
});
