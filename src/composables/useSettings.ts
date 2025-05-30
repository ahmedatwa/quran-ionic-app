import { shallowRef, computed, onBeforeMount } from "vue";
// composables
import { useStorage } from "@/composables/useStorage";
import { useLocale } from "@/composables/useLocale";
// types
import type { Recitations } from "@/types/audio";
import type { Styles } from "@/types/settings";
import type { Translation } from "@/types/translations";
// utils
import { lowerCase } from "@/utils/string";

const colorScheme = shallowRef("auto");

// Styles
const styles = shallowRef<Styles>({
  fontSize: "1",
  fontFamily: "noto-Kufi",
  fontWeight: "normal",
  wordColor: {
    code: "primary",
    key: "Blue",
  },
});

const selectedWordColor = shallowRef({ key: "Blue", code: "primary" });

export const useSettings = () => {
  const { getLine, setLocale, supportedLocales } = useLocale();
  const { getStorage, setStorage } = useStorage("__settingsDB");
  const wordColors = shallowRef([
    { key: "Blue", code: "primary" },
    { key: "Green", code: "success" },
    { key: "Red", code: "danger" },
    { key: "Tertiary", code: "tertiary" },
  ]);

  const fontSizes = shallowRef([
    { key: 1, value: "Normal" },
    { key: 2, value: "Medium" },
    { key: 3, value: "Large" },
    { key: 4, value: "Extra Large" },
    { key: 5, value: "Mega" },
  ]);

  const getSelectedFontSize = computed(() => {
    const found = fontSizes.value.find(
      (font) => font.key === styles.value.fontSize
    );
    if (found) {
      return found.value;
    }
    return "Normal";
  });
  // Color Schemes
  const colorSchemes = shallowRef([
    { key: "dark", value: getLine("settings.dark") },
    { key: "light", value: getLine("settings.light") },
    { key: "auto", value: getLine("settings.auto") },
  ]);

  const fontFamilyGroup = shallowRef([
    { key: "amiri", value: "Amiri" },
    { key: "noto-kufi", value: "Noto-Kufi" },
    { key: "hafs-nastaleeq", value: "Hafs-Nastaleeq" },
    { key: "uthman-taha-naskh", value: "Uthman-Taha-Naskh" },
  ]);

  const fontWeights = shallowRef([
    { key: "normal", value: "Normal" },
    { key: "medium", value: "Medium" },
    { key: "semibold", value: "Semi Bold" },
    { key: "bold", value: "Bold" },
    { key: "extra-bold", value: "Extra Bold" },
  ]);

  const appVersion = computed(() => import.meta.env.VITE_APP_VERSION);

  const appleColorScheme = (ev: CustomEvent) => {
    const value = ev.detail.value;
    document.documentElement.classList.toggle(
      "ion-palette-dark",
      value === "dark" ? true : false
    );
    colorScheme.value = value;
    setStorage("colorScheme", value);
  };

  const applyStyle = (key: string, ev: CustomEvent) => {
    if (key) {
      switch (key) {
        case "fontWeight":
          styles.value.fontWeight = lowerCase(ev.detail.value);
          break;
        case "fontFamily":
          styles.value.fontFamily = ev.detail.value;
          break;
        case "fontSize":
          styles.value.fontSize = ev.detail.value;
          break;
        case "wordcolor":
          styles.value.wordColor = ev.detail.value;
          break;
        default:
          break;
      }

      setStorage("styles", {
        fontWeight: styles.value.fontWeight,
        fontFamily: styles.value.fontFamily,
        fontSize: styles.value.fontSize,
        wordColor: JSON.stringify(styles.value.wordColor),
      });
    }
  };

  const updateSelectedLocale = (ev: CustomEvent) => {
    const selected = ev.detail.value;
    const localKeys = supportedLocales.value.map((lo) => lo.key);
    if (localKeys.includes(selected.key)) {
      setLocale(selected.key, selected.rtl);
      setStorage("locale", { key: selected.key, rtl: selected.rtl });
    }
  };

  const updateSelectedReciter = (reciter: Recitations) => {
    setStorage("reciter", JSON.stringify(reciter));
  };

  const updateSelectedTranslations = (translation: Translation) => {
    setStorage("translation", JSON.stringify(translation));
  };

  const getSelectedTranslationDB = computed(
    async () => await getStorage("translation")
  );

  onBeforeMount(async () => {
    // styles
    const stylesStorage = await getStorage("styles");
    if (stylesStorage) {
      styles.value = {
        ...stylesStorage,
        wordColor: JSON.parse(stylesStorage.wordColor),
      };
    }
    // color scheme
    const scheme = await getStorage("colorScheme");
    if (scheme) colorScheme.value = scheme;
  });

  return {
    colorScheme,
    colorSchemes,
    appVersion,
    styles,
    fontSizes,
    wordColors,
    fontWeights,
    fontFamilyGroup,
    selectedWordColor,
    getSelectedFontSize,
    getSelectedTranslationDB,
    updateSelectedReciter,
    updateSelectedTranslations,
    appleColorScheme,
    applyStyle,
    updateSelectedLocale,
  };
};
