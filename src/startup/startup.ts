// stores
import { useTranslationsStore } from "@/stores/TranslationsStore";
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";
// utils
import { useStorage } from "@/utils/useStorage";
import { useLocale } from "@/utils/useLocale";
import { getReciterById } from "@/utils/reciter";

export const useStartup = () => {
  const translationsStore = useTranslationsStore();
  const audioPlayerStore = useAudioPlayerStore();
  const { setLocale } = useLocale();
  const { getStorage, setStorage } = useStorage("__settingsDB");

  const setTranslation = async () => {
    const translation = await getStorage("translation");
    if (translation) {
      translationsStore.selectedTranslation = JSON.parse(translation);
    } else {
      translationsStore.selectedTranslation =
        translationsStore.translationsList.find(
          (t) => t.id === translationsStore.defaultTranslationID
        );
      setStorage(
        "translation",
        JSON.stringify(translationsStore.selectedTranslation)
      );
    }
  };

  const setScheme = async () => {
    const colorScheme = await getStorage("colorScheme");
    if (colorScheme) {
      switch (colorScheme) {
        case "auto":
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
          document.documentElement.classList.toggle(
            "ion-palette-dark",
            prefersDark.matches
          );
          break;
        case "dark":
          window.matchMedia(`(prefers-color-scheme: dark)`);
          document.documentElement.classList.toggle("ion-palette-dark", true);
          break;
        case "light":
          window.matchMedia(`(prefers-color-scheme: light)`);
          document.documentElement.classList.toggle("ion-palette-dark", false);
          break;
        default:
          break;
      }
    } else {
      setStorage("colorScheme", "auto");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
      document.documentElement.classList.toggle(
        "ion-palette-dark",
        prefersDark.matches
      );
    }
  };

  const setAudioPlayerSettings = async () => {
    const audioSettings = await getStorage("audioSettings");
    if (!audioSettings) {
      setStorage("audioSettings", {
        autoPlay: true,
        dismissOnEnd: false,
        autoScroll: true,
        tooltip: false,
        fab: true,
        autoDownload: true,
      });
    }
  };

  const setFontStyles = async () => {
    const stylesSettings = await getStorage("styles");
    if (!stylesSettings) {
      setStorage("styles", {
        fontSize: "1",
        fontFamily: "noto-kufi",
        fontWeight: "normal",
        wordColor: JSON.stringify({
          code: "primary",
          key: "Blue",
        }),
      });
    }
  };

  const setDefaultLocale = async () => {
    const localeStorage = await getStorage("locale");
    if (!localeStorage) {
      setLocale("en", false);
      setStorage("locale", { key: "en", rtl: false });
    } else {
      setLocale(localeStorage.key, localeStorage.rtl);
    }
  };

  const setReciter = async () => {
    const reciter = await getStorage("reciter");
    if (reciter) {
      audioPlayerStore.selectedReciter = JSON.parse(reciter);
    } else {
      const reciter = await getReciterById(7);
      if (reciter) {
        audioPlayerStore.selectedReciter = reciter;
        setStorage("reciter", JSON.stringify(audioPlayerStore.selectedReciter));
      }
    }
  };

  const runStartup = async () => {
    try {
      await Promise.all([
        setTranslation(),
        setScheme(),
        setAudioPlayerSettings(),
        setFontStyles(),
        setDefaultLocale(),
        setReciter(),
      ]);
    } catch (error) {
      throw error;
    }
  };
  return {
    setTranslation,
    setScheme,
    setAudioPlayerSettings,
    setFontStyles,
    setDefaultLocale,
    setReciter,
    runStartup,
  };
};
