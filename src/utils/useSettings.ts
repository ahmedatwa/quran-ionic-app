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
  autoDownload: false,
});

// Styles
const styles = ref<Styles>({
  fontSize: "1",
  fontFamily: "Noto-Kufi",
  fontWeight: "400",
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
    "Amiri",
    "Noto-Kufi",
    "Hafs-Nastaleeq",
    "Uthman-Taha-Naskh",
  ]);

  const fontWeights = ref([400, 500, 600, 700, 800]);
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
    const audio = ev.detail;
    if (audio.value === "autoPlay") {
      audioSettings.value.autoPlay = audio.checked;
    } else if (audio.value === "dismissOnEnd") {
      audioSettings.value.dismissOnEnd = audio.checked;
    } else if (audio.value === "autoScroll") {
      audioSettings.value.autoScroll = audio.checked;
    }
    setStorage("audio", audioSettings);
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
