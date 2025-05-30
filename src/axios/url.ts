import { shallowRef } from "vue";
// utils
import { verseFields, getVerseWordFields } from "@/utils/verse";
import { getVerseTranslationFields } from "@/utils/verse";
// axios
import { instance } from "@/axios";
import { Buffer } from "buffer";

// Pre-Production (Test)
// Client ID: 9c31dce5-0110-46ca-8ebc-c8c628ab4a66
// Client Secret: AWECrjWza6qpxzFCzQ5Vp0N~fi
// End-Point: https://prelive-oauth2.quran.foundation

// ⚠️ Limited data, but all features enabled for testing.

// Production (Live)
// Client ID: afc65e8a-e27e-43a6-b794-96205ff984ab
// Client Secret: w-PfiDK1uNrVphckpX2UdI-dWG
// End-Point: https://oauth2.quran.foundation

const clientID = shallowRef("9c31dce5-0110-46ca-8ebc-c8c628ab4a66");
const clientSecret = shallowRef("AWECrjWza6qpxzFCzQ5Vp0N~fi");
const endPoint = shallowRef("https://prelive-oauth2.quran.foundation");

// Audio
const audioUrl = import.meta.env.VITE_API_QDC_URL + "/audio/reciters/";
export const audioRecitersUrl = (
  reciterID: number = 6,
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

export const getAccessToken = async () => {
  const auth = Buffer.from(`${clientID.value}:${clientSecret.value}`).toString(
    "base64"
  );

  try {
    const response = await instance({
      method: "post",
      url: endPoint.value,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "grant_type=client_credentials&scope=content",
    });

    console.log(response.data.access_token);
    
  } catch (error) {
    console.error("Error getting access token:", error);
  }
};
