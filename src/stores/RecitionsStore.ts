import { defineStore } from "pinia";
import { ref, onBeforeMount, onMounted, computed } from "vue";
//axios
import { AVATAR_PLACEHOLDER_API } from "@/axios/url";
// types
import type { AudioFile } from "@/types/audio";
import type { MapRecitions, Recitations } from "@/types/audio";
// composables
import { useStorage } from "@/composables/useStorage";
import { useAlert } from "@/composables/useAlert";
// Stores
import { useAudioStore } from "@/stores/AudioStore";

export const useRecitionsStore = defineStore("recitions-store", () => {
  const audioStore = useAudioStore();
  const isLoading = ref(false);
  const settingsDB = useStorage("__settingsDB");
  const { presentToast } = useAlert();
  const audioFiles = ref<AudioFile | null>(null);
  const audioPayLoadSrc = ref<string | undefined>("");
  const selectedReciter = ref<Recitations>();
  const recitations = ref<Recitations[]>([]);

  const getAllRecitations = (): Promise<Recitations[]> => {
    return new Promise((resolve, reject) => {
      try {
        import("@jsonDataPath/reciters.json").then((res) => resolve(res.reciters));
      } catch (error) {
        reject(error);
      }
    });
  };

  const getReciterById = async (id: number) => {
    return await getAllRecitations().then((response) => {
      return response.find((res) => res.id === id);
    });
  };

  const getRecitations = async () => {
    await getAllRecitations()
      .then((response) => {
        recitations.value = response;
      })
      .catch(async (error) => {
        await presentToast({ message: String(error) });
      });
  };

  onBeforeMount(async () => {
    if (!recitations.value.length) await getRecitations();
  });

  onMounted(() => {
    if (!selectedReciter.value) {
      selectedReciter.value = recitations.value.find(({ id }) => id === 7);
      if (selectedReciter.value)
        settingsDB.setStorage("reciter", JSON.stringify(selectedReciter.value));
    }
  });

  const mapRecitions = computed((): MapRecitions | undefined => {
    if (recitations.value) {
      return recitations.value.reduce((o: any, i) => {
        (o[i.style.name as keyof typeof o] =
          o[i.style.name as keyof typeof o] || []).push(i);
        return o;
      }, {});
    }
  });

  // in case reciter avatar didn't load
  const getReciterNameInitials = computed(() => {
    if (selectedReciter.value) {
      const split = selectedReciter.value.name.split(" ");
      return split[0].charAt(0) + split[1].charAt(0);
    }
  });

  const avatarPlaceholder = computed(() => {
    return `${AVATAR_PLACEHOLDER_API}?name="${selectedReciter.value?.name}`;
  });

  const handleSelectedReciter = async (reciter: Recitations) => {
    if (reciter) {      
      selectedReciter.value = reciter;
      if (audioStore.chapterId) {
        await audioStore.getAudio({
          audioID: audioStore.chapterId,
          audioSrc: "",
          verseKey: audioStore.selectedVerseKey,
          pause: true,
        });
      }
      settingsDB.setStorage("reciter", JSON.stringify(selectedReciter.value));
    }
  };

  return {
    audioFiles,
    isLoading,
    selectedReciter,
    recitations,
    mapRecitions,
    audioPayLoadSrc,
    getReciterNameInitials,
    avatarPlaceholder,
    getRecitations,
    getReciterById,
    handleSelectedReciter,
  };
});
