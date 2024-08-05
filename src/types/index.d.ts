

interface AudioFile {
  id: number;
  chapter_id: number;
  file_size: number | null;
  format: string | null;
  total_files: number | null;
  audio_url: string;
}


interface Setting {
  autoStartPlayer: boolean;
  showVersesPages: string;
}

interface Juz {
  first_verse_id: number;
  id: number;
  juz_number: number;
  last_verse_id: number;
  verse_mapping: string[];
  verses_count: number;
  verses: Verse[]
  pagination: Pagination | null
  chapterInfo: ChapterInfo | null
  audioFile: AudioFiles | null
}

interface JuzDataParts {
  [key: number]: Verse[];
}

interface Page {
  [key: number]: Verse[]
}



interface Languages {
  id: number;
  direction: string;
  iso_code: string;
  name: string;
  native_name: string;
  translated_names: {
    name: string;
    language_name: string;
  };
  translations_count: number;
}

interface Selected {
  key: string;
  value: Chapter | Juz;
}

// interface AudioFiles {
//   audio_url: string;
//   chapter_id: number;
//   duration: number;
//   file_size: number;
//   format: string;
//   id: number;
//   verse_timings: VerseTimings[];
// }

// interface VerseTimings {
//   duration: number;
//   timestamp_from: number;
//   timestamp_to: number;
//   verse_key: string;
//   inRange?: boolean;
//   wordLocation?: number;
//   segments: object[];
// }

interface CssVars {
  quranFrontSize: number;
  translationsFontSize: number;
  quranFontFamily: string;
  translationsFontFamily: string;
  fontWeight: number
}

interface Pages {
  pageNumber: number,
  verses: Verse[]
}

export type {
  ChapterInfo,
  AudioFile,
  Verse,
  Translation,
  Tafsirs,
  Pagination,
  Setting,
  JuzDataParts,
  HeaderData,
  Languages,
  Selected,
  TranslationReduceMap,
  Juz,
  AudioFiles,
  VerseTimings,
  VerseTranslation,
  CssVars,
  Pages,
};

// interface ChapterScriptTreanslation {
//   id: number;
//   verse_key: string;
//   resource_id: number;
//   text: string;
// }

// interface Chapter {
//   id: number,
//   revelation_place: string,
//   revelation_order: number,
//   bismillah_pre: boolean,
//   name_simple: string,
//   name_complex: string,
//   name_arabic: string,
//   verses_count: number,
//   pages: number[],
//   translated_name: {
//       language_name: string,
//       name: string
//   }
// }
