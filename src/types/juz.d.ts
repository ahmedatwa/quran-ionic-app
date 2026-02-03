import { AudioFile } from "./audio";
import { Verse } from "./verse";

 

type JuzChapters = {
  juzNumber: number;
  chapterId: string | number;
  en: string;
  ar: string;
  verses: string;
};

interface Juz {
  first_verse_id: number;
  id: number;
  juz_number: number;
  last_verse_id: number;
  verse_mapping: JuzVerseMapping;
  verses_count: number;
  verses: Verse[] | null;
  chapters?: JuzChapters[];
  pagination?: Pagination | null;
  audioFile?: AudioFiles | null;
}

type Pagination = Record<
  | "per_page"
  | "current_page"
  | "next_page"
  | "total_pages"
  | "total_records"
  | "totalRecordsFetched",
  number
>;

interface juzVersesByPageMap {
  [key: number]: Verse[];
}

interface JuzHeaderData {
  left?: { nameArabic: string; nameSimple: string; bismillahPre: boolean };
  right: {
    pageNumber: string | number;
    hizbNumber: string | number;
    juzNumber: string | number;
  };
}

type JuzVerseMapping = {
  [key: number]: string;
};

type JuzVersesIntersecting = {
  currentVerseNumber: number;
  lastVerseNumber: number;
};


interface JuzsToChaptersReturn {
  id: number;
  juz_number: number;
  verse_mapping: VerseMapping;
  first_verse_id: number;
  last_verse_id: number;
  verses_count: number;
  verses: Verse[];
  chapters: {
    juzNumber: number;
    chapterId: string | number;
    en: string;
    ar: string;
    verses: string;
  }[];
}
export {
  Juz,
  JuzHeaderData,
  juzVersesByPageMap,
  JuzVerseMapping,
  JuzChapters,
  JuzsToChaptersReturn,
  JuzVersesIntersecting,
};
