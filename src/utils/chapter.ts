import type { Chapter, ChapterInfo, ChaptersInfo } from "@/types/chapter";
import type { JSONVersesPromiseReturn } from "@/types/verse";

/** 

 *
 * @returns [] of chapters
 */
export const jsonAllChapters = (): Promise<Chapter[]> => {
  return new Promise((resolve, reject) => {
    try {
      import(`@jsonDataPath/chapters/chapters.json`).then((result) => {
        resolve(result.chapters);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 *  Load Verses from JSON file
 * @param fileName
 * @returns
 */
export const jsonChapterVersesById = (
  id: string
): Promise<JSONVersesPromiseReturn> => {
  return new Promise((resolve, reject) => {
    try {
      import(`@jsonDataPath/chapters/verses/chapter-${id}.json`).then(
        (response) => {
          resolve(response);
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * chapter Info
 */
const loadAllChaptersInfo = (): Promise<ChaptersInfo[]> => {
  return new Promise((resolve, reject) => {
    try {
      import("@jsonDataPath/chapters/chapters-info.json").then((res) =>
        resolve(res.default)
      );
    } catch (e) {
      reject(e);
    }
  });
};

export const getChapterInfoByChapterId = async (id: string) => {
  const response = await loadAllChaptersInfo();
  return response[0][id];
};


