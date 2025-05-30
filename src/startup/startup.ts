import { onBeforeMount, onMounted, shallowRef } from "vue";
// stores
import { useTranslationsStore } from "@/stores/TranslationsStore";
import { useRecitionsStore } from "@/stores/RecitionsStore";
// composables
import { useStorage } from "@/composables/useStorage";
import { useLocale } from "@/composables/useLocale";
// capacitor plugins
import { Device } from "@capacitor/device";
// axios
import { getAccessToken } from "@/axios/url";

export const useStartup = () => {
  const translationsStore = useTranslationsStore();
  const recitionsStore = useRecitionsStore();

  const { setLocale } = useLocale();
  const { getStorage, setStorage } = useStorage("__settingsDB");
  const deviceLocale = shallowRef("");

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
        volume: 100,
        loopAudio: "none",
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
      setLocale(deviceLocale.value, false);
      setStorage("locale", { key: deviceLocale.value, rtl: false });
    } else {
      setLocale(localeStorage.key, localeStorage.rtl);
    }
  };

  const setReciter = async () => {
    const reciter = await getStorage("reciter");
    if (reciter) {
      recitionsStore.selectedReciter = JSON.parse(reciter);
    } else {
      const reciter = await recitionsStore.getReciterById(7);
      if (reciter) {
        recitionsStore.selectedReciter = reciter;
        setStorage("reciter", JSON.stringify(recitionsStore.selectedReciter));
      }
    }
  };

  const logDeviceLocaleInfo = async () => {
    const info = await Device.getLanguageCode();
    if (info) deviceLocale.value = info.value;
  };

  const runStartup = async () => {
    try {
      await Promise.all([
        logDeviceLocaleInfo(),
        setTranslation(),
        setScheme(),
        setAudioPlayerSettings(),
        setFontStyles(),
        setDefaultLocale(),
        setReciter(),
      ]);
    } catch (error) {
      console.warn(error);
    }
  };

  onBeforeMount(() =>  import.meta.env.DEV ? console.info("startup-script loaded 👽") : ""
  );


  onMounted(async () =>
    await getAccessToken().then((res) => {
      console.log(res);
      
    })
  )

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
