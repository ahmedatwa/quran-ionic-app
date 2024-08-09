import { defineStore } from "pinia";
import { useStorage } from "@/utils/useStorage";
import { onMounted, ref, watchEffect } from "vue";
import type { Styles, FontFamilyGroup, FontWeights } from "@/types/settings";

export const useSettingStore = defineStore("setting-store", () => {
  const settingsDB = useStorage("__settingsdb");
  const versesPages = ref([10, 20, 30, 40, 50]);
  const isAppLoading = ref(false);
  const paletteToggle = ref(false);
  const VersesPerPage = ref(10);
  const highlightedWordColor = ref("blue-darken-2");

  const cssVars = ref<Styles>({
    quranFrontSize: 1,
    quranFontFamily: "Noto-Kufi",
    translationsFontSize: 1,
    translationsFontFamily: "1",
    fontWeight: 400,
  });

  const fontWeights = ref<FontWeights>([400, 500, 600, 700, 800]);
  const fontFamilyGroup = ref<FontFamilyGroup>([
    "Amiri",
    "Noto-Kufi",
    "Hafs-Nastaleeq",
    "Uthman-Taha-Naskh",
  ]);

  // watchEffect(async () => {
  //   if (settingsDB) {
  //     await settingsDB.setStorage("styles", cssVars);
  //   }
  // });

  onMounted(async () => {
    // Styles
    const styles = await settingsDB.getStorage("styles");
    if (styles) {
      cssVars.value = {
        quranFontFamily: styles.fontFamily,
        quranFrontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
      };
    }
    // const styleSettings = getStorage("style-setting");
    // if (styleSettings) {
    //   cssVars.value = styleSettings;
    // } else {
    //   setStorage("style-setting", cssVars.value);
    // }

    // const colorScheme = getStorage("color-scheme");
    // if (colorScheme) {
    //   paletteToggle.value = colorScheme === "dark" ? true : false;
    // }
  });

  return {
    paletteToggle,
    cssVars,
    fontWeights,
    versesPages,
    isAppLoading,
    VersesPerPage,
    fontFamilyGroup,
    highlightedWordColor,
  };
});
