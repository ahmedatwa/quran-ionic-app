import { shallowRef, computed, onBeforeMount } from "vue";
// composables
import { useStorage } from "@/composables/useStorage";
import { useLocale } from "@/composables/useLocale";
// types
import type { Recitations } from "@/types/audio";
import type { Styles } from "@/types/settings";
import type { Translation } from "@/types/translations";

const colorScheme = shallowRef("auto");

// Styles
const styles = shallowRef<Styles>({
  fontSize: "Normal",
  fontFamily: "Noto-Kufi",
  fontWeight: "Normal",
  wordColor: "Primary",
});

export const useSettings = () => {
  const { getLine, setLocale, supportedLocales } = useLocale();
  const { getStorage, setStorage } = useStorage("__settingsDB");
  const wordColors = shallowRef(["Primary", "Success", "Danger", "Tertiary"]);
  const fontSizes = shallowRef([
    "Normal",
    "Medium",
    "Large",
    "Extra Large",
    "Mega",
  ]);
  const fontFamilyGroup = shallowRef([
    "Amiri",
    "Noto-Kufi",
    "Hafs-Nastaleeq",
    "Uthman-Taha-Naskh",
  ]);

  const fontWeights = shallowRef([
    "Normal",
    "Medium",
    "Semi Bold",
    "Bold",
    "Extra Bold",
  ]);

  const getSelectedFontSize = computed(() =>
    fontSizes.value.find((font) => font === styles.value.fontSize)
  );
  // Color Schemes
  const colorSchemes = shallowRef([
    { key: "dark", value: getLine("settings.dark") },
    { key: "light", value: getLine("settings.light") },
    { key: "auto", value: getLine("settings.auto") },
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
    console.log(ev);

    if (key) {
      switch (key) {
        case "fontWeight":
          styles.value.fontWeight = ev.detail.value;
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
        wordColor: styles.value.wordColor,
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
    const stylesStorage = (await getStorage("styles")) as Styles;
    if (stylesStorage) {
      styles.value = {
        ...stylesStorage,
        wordColor: stylesStorage.wordColor,
      };
    }
    // color scheme
    const scheme = await getStorage("colorScheme");
    if (scheme) colorScheme.value = scheme;
  });

  const computedCSS = computed(() => {
    return {
      fontFamily: `var(--font-family-${styles.value.fontFamily.toLocaleLowerCase()})`,
      fontSize:
        typeof styles.value.fontSize === "string"
          ? `var(--font-size-${styles.value.fontSize.toLocaleLowerCase()})`
          : `var(--font-size-${styles.value.fontSize})`,
      fontWeight: `var(--font-weight-${styles.value.fontWeight.toLocaleLowerCase()})`,
      colorCode: styles.value.wordColor.toLocaleLowerCase(),
    };
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
    getSelectedFontSize,
    getSelectedTranslationDB,
    computedCSS,
    updateSelectedReciter,
    updateSelectedTranslations,
    appleColorScheme,
    applyStyle,
    updateSelectedLocale,
  };
};
