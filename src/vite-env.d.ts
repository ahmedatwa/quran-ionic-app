/// <reference types="vite/client" />
declare const __JSON_DATA_PATH__NAME__: string;
declare const __Juz_To_Chapters_Path__: string;


interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_API_QDC_URL: string;
  readonly VITE_AVATAR_PLACEHOLDER_API: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
