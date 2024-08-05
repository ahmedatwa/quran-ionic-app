import { defineStore } from "pinia";
import { computed, onMounted, ref, watchEffect } from "vue";
import type { CssVars } from "@/types";
import { getStorage, setStorage } from "@/utils/storage";
import { loadingIntervalValue } from "@/utils/interval";

export const useSettingStore = defineStore("setting-store", () => {
  const versesPages = ref([10, 20, 30, 40, 50]);
  const isAppLoading = ref(false);
  const paletteToggle = ref(false);
  const appIntervalValue = computed(() => loadingIntervalValue.value);
  const VersesPerPage = ref(10);
  const highlightedWordColor = ref("blue-darken-2");

  const cssVars = ref<CssVars>({
    quranFrontSize: 3,
    quranFontFamily: "Noto-Kufi",
    translationsFontSize: 3,
    translationsFontFamily: "1",
    fontWeight: 400,
  });

  const fontWeights = ref([400, 500, 600, 700, 800]);
  const fontFamilyGroup = ref([
    "Amiri",
    "Noto-Kufi",
    "Hafs-Nastaleeq",
    "Uthman-Taha-Naskh",
  ]);

  watchEffect(() => {
    if (cssVars.value) {
      setStorage("style-setting", cssVars.value);
    }
  });

  onMounted(() => {
    const styleSettings = getStorage("style-setting");
    if (styleSettings) {
      cssVars.value = styleSettings;
    } else {
      setStorage("style-setting", cssVars.value);
    }

    const colorScheme = getStorage("color-scheme");
    if (colorScheme) {
      paletteToggle.value = colorScheme === "dark" ? true : false;
    }
  });

  return {
    paletteToggle,
    cssVars,
    fontWeights,
    versesPages,
    isAppLoading,
    VersesPerPage,
    fontFamilyGroup,
    appIntervalValue,
    highlightedWordColor,
  };
});
