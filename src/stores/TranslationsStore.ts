import { defineStore } from "pinia";
import { ref, computed, onBeforeMount } from "vue";
// types
import { Translation, TranslationReduceMap } from "@/types/translations";
// composables
import { useAlert } from "@/composables/useAlert";

export const useTranslationsStore = defineStore("translations-store", () => {
  const isLoading = ref(false);
  const translationsList = ref<Translation[]>([]);
  const selectedTranslation = ref<Translation>();
  const selectedTranslationId = computed(() => selectedTranslation.value?.id);
  const defaultTranslationID = ref(85);
  const { presentToast } = useAlert();

  const getAllTranslations = (): Promise<Translation[]> => {
    return new Promise((resolve, reject) => {
      try {
        import(`@jsonDataPath/translations.json`).then((response) => {
          resolve(response.translations);
        });
      } catch (error) {
        reject(error);
      }
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
    if (!translationsList.value.length) {
      isLoading.value = true;
      await getAllTranslations()
        .then((response) => {
          translationsList.value = response;
        })
        .catch(async (error) => {
          await presentToast({ message: String(error) });
        })
        .finally(() => {
          isLoading.value = false;
        });
    }
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
  };
});
