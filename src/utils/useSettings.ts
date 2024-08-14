import { ref, computed, onMounted } from "vue";
import { useStorage } from "@/utils/useStorage";
import { useLocale } from "@/utils/useLocale";

// types
import type { AudioPlayerSettings } from "@/types/audio";
import type { Styles } from "@/types/settings";

const colorScheme = ref("auto");
// Audio
const audioSettings = ref<AudioPlayerSettings>({
  autoPlay: true,
  dismissOnEnd: true,
  autoScroll: true,
  autoDownload: true,
});

// Styles
const styles = ref<Styles>({
  fontSize: "1",
  fontFamily: "noto-Kufi",
  fontWeight: "normal",
});

export const useSettings = () => {
  const { getLine, setLocale, supportedLocales } = useLocale();
  const { getStorage, setStorage } = useStorage("__settingsDB");

  // Color Schemes
  const colorSchemes = ref([
    { key: "dark", value: getLine("settings.dark") },
    { key: "light", value: getLine("settings.light") },
    { key: "auto", value: getLine("settings.auto") },
  ]);

  const fontFamilyGroup = ref([
    { key: "amiri", value: "Amiri" },
    { key: "noto-kufi", value: "Noto-Kufi" },
    { key: "hafs-nastaleeq", value: "Hafs-Nastaleeq" },
    { key: "uthman-taha-naskh", value: "Uthman-Taha-Naskh" },
  ]);

  const fontWeights = ref([
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

  const applyFontSize = async (ev: CustomEvent) => {
    styles.value.fontSize = ev.detail.value;
    await setStorage("styles", styles);
  };
  const applyFontFamily = (ev: CustomEvent) => {
    styles.value.fontFamily = ev.detail.value;
    setStorage("styles", styles);
  };

  const applyFontWeight = (ev: CustomEvent) => {
    styles.value.fontWeight = ev.detail.value;
    setStorage("styles", styles);
  };

  const handleAudioSetting = (ev: CustomEvent) => {
    const audio: {checked: boolean, value: string} = ev.detail;          
    switch (audio.value) {
      case "autoPlay":
        audioSettings.value.autoPlay = audio.checked;
        break;
      case "dismissOnEnd":
        audioSettings.value.dismissOnEnd = audio.checked;
        break;
      case "autoScroll":
        audioSettings.value.autoScroll = audio.checked;
        break;
      case "autoDownload":
        audioSettings.value.autoDownload = audio.checked;
        break;
    }

    setStorage("audioSettings", audioSettings);
  };

  const updateSelectedLocale = (ev: CustomEvent) => {
    const selected = ev.detail.value;
    const localKeys = supportedLocales.value.map((lo) => lo.key);
    if (localKeys.includes(selected.key)) {
      setLocale(selected.key, selected.rtl);
      setStorage("locale", { key: selected.key, rtl: selected.rtl });
    }
  };

  onMounted(async () => {
    // styles
    const stylesStorage = await getStorage("styles");
    if (stylesStorage) styles.value = stylesStorage;
    // Audio
    const audioStorage = await getStorage("audioSettings");
    if (audioStorage) audioSettings.value = audioStorage;
    // color scheme
    const scheme = await getStorage("colorScheme");
    if (scheme) colorScheme.value = scheme;
  });

  return {
    colorScheme,
    colorSchemes,
    appVersion,
    audioSettings,
    styles,
    fontWeights,
    fontFamilyGroup,
    appleColorScheme,
    applyFontSize,
    applyFontFamily,
    applyFontWeight,
    handleAudioSetting,
    updateSelectedLocale,
  };
};
