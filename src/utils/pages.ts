import jsonChaptersData from "@/json/chapters.json";
import type { Verse } from "@/types/verse";
import { localizeNumber, _range } from "@/utils/number";

export const DEFAULT_NUMBER_OF_PAGES = 604;

type Pages2ChaptersMappings = {
  [key: string]: string[];
};

export const getPages2ChaptersMappings =
  (): Promise<Pages2ChaptersMappings> => {
    return new Promise((res) => {
      import("@/json/page-to-chapter-mappings.json").then((data) => {
        res(data.default);
      });
    });
  };

/**
 * get getAllPageMappings for all Pages
 *
 * @returns {[juz: string]: Page2ChaptersMapping}
 */

// export const getPages2ChaptersMappings = () => {
//   return jsonPagesChaptersMappingData;
// };

const getChapterIdsForPage = async (pageId: number) => {
  const result: Pages2ChaptersMappings = await getPages2ChaptersMappings();
  return result[pageId];
};
/**
 * get the chapter name for page
 * @param pageId
 * @returns
 */
type ChaptersMap = {
  id: number;
  nameArabic: string;
  nameSimple: string;
};
const getChaptersForPage = async (pageId: number): Promise<ChaptersMap[]> => {
  const result: ChaptersMap[] = [];
  const pageChapters = await getChapterIdsForPage(pageId);
  pageChapters.forEach((ch) => {
    const chapter = jsonChaptersData.chapters.find(
      (chapter) => chapter.id === Number(ch)
    );
    if (chapter) {
      result.push({
        id: chapter.id,
        nameArabic: chapter.nameArabic,
        nameSimple: chapter.nameSimple,
      });
    }
  });
  return result;
};

/**
 * return all pages
 * with type property
 */
export const getAllPages = (lang: string = "en") => {
  const pages = _range(DEFAULT_NUMBER_OF_PAGES, 1).map(async (page) => {
    const chaptersMap = await getChaptersForPage(page);
    return {
      pageNumber: Number(localizeNumber(page, lang)),
      verses: [],
      pagination: null,
      chaptersMap,
      audioFile: null,
    };
  });
  return Promise.all(pages);
};

interface GetAllPagesToChapters {
  pageNumber: number;
  verses: Verse[];
  pagination: null;
  chaptersMap: {
    id: number;
    nameArabic: string;
    nameSimple: string;
  }[];
  audioFile: null;
}

export const getAllPagesToChapters = (): Promise<GetAllPagesToChapters[]> => {
  return new Promise((resolve, reject) => {
    try {
      import("@/json/pages-to-chapters.json").then((res) =>
        resolve(res.default)
      );
    } catch (error) {
      reject(error);
    }
  });
};
