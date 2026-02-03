import { defineStore } from "pinia";
import { shallowRef, computed, onBeforeMount, ref } from "vue";
// composables
import { useStorage } from "@/composables/useStorage";
import { useLocale } from "@/composables/useLocale";
// types
import type { Recitations } from "@/types/audio";
import type { Styles, ComputedQuranCSSReturn } from "@/types/settings";
import type { ComputedTranslationCSSReturn } from "@/types/settings";
import type { Translation } from "@/types/translations";

export const useSettingsStore = defineStore("settings-store", () => {
  const { getLine, setLocale, supportedLocales } = useLocale();
  const { getStorage, setStorage } = useStorage("__settingsDB");
  const wordColors = shallowRef(["Primary", "Success", "Danger", "Tertiary"]);
  const computedFontSizes = computed(() => Array.from({ length: 10 }));
  const colorScheme = shallowRef("auto");

  // Styles
  const styles = ref<Styles>({
    quranFontSize: 1,
    translationFontSize: 1,
    quranFontFamily: "Noto-Kufi",
    translationFontFamily: "",
    fontWeight: "Normal",
    wordColor: "Primary",
  });

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

  const setFontSize = async (
    key: "quran" | "translation",
    operation: "add" | "remove"
  ) => {
    switch (key) {
      case "quran":
        if (operation === "add") {
          if (styles.value.quranFontSize !== 10) {
            styles.value.quranFontSize++;
          }
        } else {
          if (styles.value.quranFontSize !== 1) {
            styles.value.quranFontSize--;
          }
        }
        break;
      case "translation":
        if (operation === "add") {
          if (styles.value.translationFontSize !== 10) {
            styles.value.translationFontSize++;
          }
        } else {
          if (styles.value.translationFontSize !== 1) {
            styles.value.translationFontSize--;
          }
        }
        break;
    }

    await setStorage("styles", { ...styles.value });
  };

  const setFontFamily = async (
    key: "quran" | "translation",
    event: CustomEvent
  ) => {
    if (key === "quran") {
      styles.value.quranFontFamily = event.detail.value;
    } else {
      styles.value.quranFontFamily = event.detail.value;
    }
    await setStorage("styles", { ...styles.value });
  };

  const setFontWight = async (event: CustomEvent) => {
    styles.value.fontWeight = event.detail.value;
    await setStorage("styles", { ...styles.value });
  };

  const setWordColor = async (event: CustomEvent) => {
    styles.value.wordColor = event.detail.value;
    await setStorage("styles", { ...styles.value });
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
    } else {
      await setStorage("styles", styles);
    }
    // color scheme
    const scheme = await getStorage("colorScheme");
    if (scheme) colorScheme.value = scheme;
  });

  const computedTranslationCSS = computed((): ComputedTranslationCSSReturn => {
    return {
      fontFamily: `var(--translation-font-family-${styles.value.translationFontFamily.toLowerCase()})`,
      fontSize: `var(--translation-font-size-${styles.value.translationFontSize.toString()})`,
    };
  });

  const computedQuranCSS = computed((): ComputedQuranCSSReturn => {
    return {
      fontFamily: `var(--quran-font-family-${styles.value.quranFontFamily.toLowerCase()})`,
      fontSize: `var(--quran-font-size-${styles.value.quranFontSize.toString()})`,
      fontWeight: `var(--quran-font-weight-${styles.value.fontWeight.toLowerCase()})`,
      wordColor: styles.value.wordColor.toLowerCase(),
    };
  });

  return {
    colorScheme,
    colorSchemes,
    appVersion,
    computedFontSizes,
    styles,
    fontSizes,
    wordColors,
    fontWeights,
    fontFamilyGroup,
    getSelectedTranslationDB,
    computedTranslationCSS,
    computedQuranCSS,
    setFontSize,
    setFontFamily,
    setWordColor,
    setFontWight,
    updateSelectedReciter,
    updateSelectedTranslations,
    appleColorScheme,
    updateSelectedLocale,
  };
});
