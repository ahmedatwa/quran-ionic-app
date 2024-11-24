import { verseFields, getVerseWordFields } from "@/utils/verse";
import { getVerseTranslationFields } from "@/utils/verse";

// Audio
const audioUrl = import.meta.env.VITE_API_QDC_URL + "/audio/reciters/";
export const audioRecitersUrl = (
  reciterID: number,
  audioID: number
): string => {
  return (
    audioUrl + reciterID + "/audio_files?chapter=" + audioID + "&segments=true"
  );
};

export const recitationsUrl = audioUrl;
export const AVATAR_PLACEHOLDER_API = "https://ui-avatars.com/api/";

export const makeChapterInfoUrl = (id: number, locale: string = "en") => {
  return `/chapters/${id}/info?language=${locale}`;
};
// Translations
export const makeTranslationsUrl = (locale: string = "en") => {
  return "/resources/translations?language=" + locale;
};
// Verses
const urlFields = `&words=true&translation_fields=${getVerseTranslationFields()}&fields=${verseFields.join(
  ","
)}&word_fields=${getVerseWordFields()}`;

export const getVersesUrl = (
  key: string,
  id: number | string,
  translations: string | number,
  page?: number,
  limit?: number
) => {
  const currentPage = page ? "&page=" + page : "";
  const currentLimit = limit ? "&per_page" + limit : "";
  return `/verses/${key}/${id}?translations=${translations}&${urlFields}${currentPage}${currentLimit}`;
};
