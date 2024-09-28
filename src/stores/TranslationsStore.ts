import { defineStore } from "pinia";
import { ref, computed, onBeforeMount } from "vue";
// types
import { Translation, TranslationReduceMap } from "@/types/translations";
import { useAlert } from "@/utils/useAlert";

export const useTranslationsStore = defineStore("translations-store", () => {
  const isLoading = ref(false);
  const translationsList = ref<Translation[]>([]);
  const selectedTranslation = ref<Translation>();
  const selectedTranslationId = computed(() => selectedTranslation.value?.id);
  const defaultTranslationID = ref(131)
  const { presentToast } = useAlert();

  const getAllTranslations = (): Promise<Translation[]> => {
    return new Promise((resolve, reject) => {
      try {
        import("@/json/translations.json").then((response) => {
          resolve(response.translations);
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const getTranslations = async () => {
    isLoading.value = true;
    await getAllTranslations()
      .then((response) => {
        response.forEach((res) => translationsList.value?.push({ ...res }));
      })
      .catch(async (error) => {
        await presentToast({ message: String(error) });
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  // Group translators by language
  const translations = computed(() => {
    if (translationsList.value) {
      return translationsList.value.reduce(
        (acc: TranslationReduceMap, obj: Translation) => {
          (acc[obj.language_name] = acc[obj.language_name] || []).push(obj);
          return acc;
        },
        {}
      );
    }
  });

  onBeforeMount(async () => {
    await getTranslations();
  });

  const groupTranslationsByLanguage = computed(() => {
    if (translationsList.value) {
      return translationsList.value.reduce((o: any, i) => {
        (o[i.language_name as keyof typeof o] =
          o[i.language_name as keyof typeof o] || []).push(i);
        return o;
      }, {});
    }
  });

  return {
    translations,
    isLoading,
    translationsList,
    selectedTranslation,
    selectedTranslationId,
    defaultTranslationID,
    groupTranslationsByLanguage,
    getTranslations,
  };
});
