import { ref, computed, onMounted } from "vue";
import { setStorage, getStorage } from "@/utils/storage";
import locales from "@/locales";

const rtl = ref(false);
const locale = ref("en");

const getLocale = computed(() => locale.value);
const getLocaleValue = computed(() => {
  if (locale.value) {
    const result = supportedLocales.value.find((l) => l.key === locale.value);
    return result?.value;
  }
});

const isRtl = computed(() => rtl.value);

const supportedLocales = ref([
  { key: "en", value: "English", rtl: false },
  { key: "ar", value: "Arabic", rtl: true },
]);

export const useLocale = () => {
  const format = (line: string, args: any[]): string => {
    return line.replace(/{(\d+)}/g, (value, i) => {
      return typeof args[i] != undefined ? args[i] : value;
    });
  };

  const setLocale = (str: string, direction: boolean) => {
    locale.value = str;
    rtl.value = direction;
    setStorage("locale", { key: str, rtl: direction });
  };

  const getLine = (key: string, replacement?: string[]): string => {
    const result = key.split(".").reduce((o: string | object, i: string) => {
      if (typeof o === "object") {
        return o[i as keyof typeof o];
      } else {
        return o;
      }
    }, locales[locale.value as keyof typeof locales]);

    if (result === undefined) return key;
    if (replacement) return format(result.toString(), replacement);
    return result.toString();
  };

  onMounted(() => {
    const storage = getStorage("locale");
    if (storage) {
      locale.value = storage.key;
      rtl.value = storage.rtl;
      if (storage.rtl) {
        document.documentElement.dir = "rtl";
      } else {
        document.documentElement.dir = "ltr";
      }
    }
  });
  
  return {
    getLine,
    setLocale,
    getLocale,
    isRtl,
    supportedLocales,
    getLocaleValue,
  };
};
