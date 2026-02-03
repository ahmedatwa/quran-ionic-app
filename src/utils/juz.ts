// utils
import { jsonAllChapters } from "@/utils/chapter";
// type
import type { Verse } from "@/types/verse";
import type { JuzsToChaptersReturn } from "@/types/juz";
import type { JSONVersesPromiseReturn } from "@/types/verse";

/**
 *
 * @param juzNumber
 * @returns
 */
export const loadJuzsJSONData = async (
  juzNumber: number
): Promise<JSONVersesPromiseReturn> => {  
  return new Promise((resolve, reject) => {
    try {
      import(`@jsonDataPath/juzs/verses/juz-${juzNumber}.json`).then(
        (response) => resolve(response.default)
      );
    } catch (error) {
      reject(error);
    }
  });
};

type ReturnJuzToChaptersMapping = {
  [key: string]: string[];
};
export const juzToChaptersMapping =
  async (): Promise<ReturnJuzToChaptersMapping> => {
    return new Promise((resolve, reject) => {
      try {
        import("@jsonDataPath/juzs/juz-to-chapter-mappings.json").then(
          (result) => {
            resolve(result.default);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  };

// };
/**
 * Given a juzId, get chapters ids from a json file
 *
 * @param {string} juzId
 * @returns {string[]} chapterIds
 */
type ReturnChapterNameByJuzId = {
  nameArabic: string;
  nameSimple: string;
  bismillahPre: boolean;
};
export const getChapterNameByJuzId = async (
  juzId: string | number | undefined,
  index: number
): Promise<ReturnChapterNameByJuzId> => {
  const [mapping, all] = await Promise.all([
    await juzToChaptersMapping(),
    await jsonAllChapters(),
  ]);

  const juzData = mapping[juzId as keyof typeof mapping];
  const chapterId = juzData[index];
  let object = {
    nameArabic: "",
    nameSimple: "string",
    bismillahPre: false,
  };

  all.forEach((chapter) => {
    if (chapter.id === Number(chapterId)) {
      object = {
        nameSimple: chapter.nameSimple,
        nameArabic: chapter.nameArabic,
        bismillahPre: chapter.bismillahPre,
      };
    }
  });
  return object;
};

export const getFirstVerseOfJuzByPage = (verses: Verse[]) => {
  return verses[0];
};

/**
 *
 * @returns Promise<JuzsToChapters[]>
 */

export const AllJuzsToChapters = (): Promise<JuzsToChaptersReturn[]> => {
  return new Promise((resolve, reject) => {
    try {
      import("@jsonDataPath/juzs/juzs-to-chapters.json").then((res) =>
        resolve(res.default)
      );
    } catch (error) {
      reject(error);
    }
  });
};
