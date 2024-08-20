import { defineStore } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
// stores
import { useChapterStore } from "@/stores/ChapterStore";
import { useTranslationsStore } from "@/stores/TranslationsStore";
// axios
import { instance } from "@/axios";
import { getVersesUrl } from "@/axios/url";
// utils
import { _range } from "@/utils/number";
import { getAllPagesToChapters } from "@/utils/pages";
import { useStorage } from "@/utils/useStorage";
import { useAlert } from "@/utils/useAlert";
// types
import type { Page } from "@/types/page";
import type { Verse } from "@/types/verse";

export const usePageStore = defineStore("page-store", () => {
  const isLoading = ref(false);
  const perPage = ref(10);
  const { selectedTranslation } = useTranslationsStore();
  const { getChapterNameByChapterId } = useChapterStore();
  const { getStorage, setStorage } = useStorage("__pageDB");
  const { presentToast } = useAlert();
  const selectedPage = ref<Page | null>(null);
  const selectedPageId = ref<number>();
  const searchValue = ref("");
  const pagesPageSize = ref(20);
  const pagesCurrentPage = ref(1);
  const pagesList = ref<Page[]>([]);
  const selectedTranslationId = computed(() => {
    if (selectedTranslation?.id) {
      return String(selectedTranslation.id);
    }
    return "131";
  });
  const pages = computed(() => {
    if (pagesList.value) {
      return pagesList.value
        .filter((page) => {
          return page.pageNumber
            .toLocaleString()
            .includes(searchValue.value.toLocaleLowerCase());
        })
        .sort((a, b) => a.pageNumber - b.pageNumber)
        .filter((__, index) => {
          let start = (pagesCurrentPage.value - 1) * pagesPageSize.value;
          let end = pagesCurrentPage.value * pagesPageSize.value;
          if (index >= start && index < end) return true;
        });
    }
  });

  const getVerses = async (
    id: number,
    loading: boolean,
    page: number = 1,
    limit: number = perPage.value
  ) => {
    isLoading.value = loading;
    selectedPageId.value = id;
    const currentPage = pagesList.value?.find((p) => p.pageNumber === id);
    // Check for DB Storage to avoid the api call
    if (currentPage) {
      const check = await isDBStorageData(id, currentPage);
      if (check) {
        isLoading.value = false;
        return;
      }
    }

    await instance
      .get(
        getVersesUrl("by_page", id, selectedTranslationId.value, page, limit)
      )
      .then((response) => {
        if (currentPage) {
          response.data.verses.forEach((verse: Verse) => {
            const verseFound = currentPage.verses?.find(
              (v) => v.verse_key === verse.verse_key
            );

            if (!verseFound) {
              currentPage.verses?.push({ ...verse, bookmarked: false });
            }
          });

          currentPage.pagination = response.data.pagination;
          if (selectedPage.value?.pageNumber === currentPage.pageNumber) {
            if (selectedPage.value) {
              selectedPage.value.verses = currentPage.verses;
              selectedPage.value.pagination = currentPage.pagination;
            }
          }
        }
      })
      .catch(async (error) => {
        await presentToast({ message: String(error) });
      })
      .finally(() => {
        isLoading.value = false;
        // save chapter in DB
        setStorage(String(selectedPage.value?.pageNumber), {
          data: JSON.stringify(selectedPage.value),
          length: selectedPage.value?.verses?.length,
        });
      });
  };

  onMounted(async () => {
    await getAllPagesToChapters().then((response) => {
      response.forEach((res) => pagesList.value.push(res));
    });
  });

  watch(
    () => selectedTranslationId.value,
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

  const isDBStorageData = async (chapterId: number, page: Page) => {
    const pagesDB: { data: string; length: number } = await getStorage(
      String(chapterId)
    );
    if (pagesDB) {
      page.verses = JSON.parse(pagesDB.data).verses;
      page.pagination = JSON.parse(pagesDB.data).pagination;
      selectedPage.value = page;
      return true;
    }

    return false;
  };

  return {
    pages,
    pagesList,
    perPage,
    isLoading,
    selectedPage,
    selectedPageId,
    searchValue,
    getLastVerseOfPage,
    getFirstVerseOfPage,
    getInitialHeaderData,
    pagesCurrentPage,
    pagesPageSize,
    getVerses,
  };
});
