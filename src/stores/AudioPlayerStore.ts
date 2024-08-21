import { defineStore } from "pinia";
import { ref, onMounted, computed, watchEffect, onUnmounted } from "vue";
//axios
import { instance } from "@/axios";
import { audioRecitersUrl, recitationsUrl } from "@/axios/url";
import { AVATAR_PLACEHOLDER_API } from "@/axios/url";
// types
import type { AudioFile, AudioPlayerSettings } from "@/types/audio";
import type { MapRecitions, PlayAudioEmit } from "@/types/audio";
import type { VerseTimingsProps, Recitations } from "@/types/audio";
// stores
import { useChapterStore } from "@/stores/ChapterStore";
// utils
import { useStorage } from "@/utils/useStorage";
import { useBlob } from "@/utils/useBlob";
import { useAlert } from "@/utils/useAlert";

export const useAudioPlayerStore = defineStore("audio-player-store", () => {
  const { getChapterNameByChapterId, getChapter, TOTAL_CHAPTERS } =
    useChapterStore();
  const isVisible = ref(false);
  const isLoading = ref(false);
  const settingsDB = useStorage("__settingsDB");
  const audioDB = useStorage("__audioDB");
  const { encodeBlobToBase64 } = useBlob();
  const { presentToast, presentAlert } = useAlert();
  const audioFiles = ref<AudioFile | null>(null);
  const autoStartPlayer = ref(false);
  const chapterId = ref<number>();
  const audioPayLoadSrc = ref<string | undefined>("");
  const selectedVerseKey = ref<string | undefined>("");
  const selectedReciter = ref<Recitations>();
  const playbackSpeeds = ref([
    "0.25",
    "0.5",
    "0.75",
    "Normal",
    "1.25",
    "1.5",
    "1.75",
    "2",
  ]);
  const recitations = ref<Recitations[]>([]);
  const verseTiming = ref<VerseTimingsProps>();
  const isDownloadSuccess = ref(false);
  const playbackRate = ref("Normal");
  const listenerActive = ref(false);
  const progressTimer = ref<number>(0);
  const elapsedTime = ref("00:00");
  const audioDuration = ref("");
  const duration = ref(0);
  const mediaVolume = ref(1);
  const isPlaying = ref(false);
  const isMuted = ref(false);
  const isPaused = ref(false);
  const isResumed = ref(false);
  const loopAudio = ref("none");
  const audioBuffer = ref();
  const currentTimestamp = ref(0);
  const audioPlayerSetting = ref({
    fullwidth: false,
    autoPlay: true,
    dismissOnEnd: true,
    autoScroll: true,
    tooltip: false,
  });

  const chapterName = computed(() => {
    if (chapterId.value) {
      const chapter = getChapterNameByChapterId(chapterId.value);
      if (chapter) {
        return chapter.nameSimple;
      }
    }
  });

  const getAudio = async (payload: PlayAudioEmit, audioSrc?: string) => {
    //https://api.qurancdn.com/api/qdc/audio/reciters/9/audio_files?chapter=1&segments=true
    // if (payload.audioID === chapterId.value) return;
    isLoading.value = true;
    chapterId.value = payload.audioID;
    selectedVerseKey.value = payload.verseKey;
    audioPayLoadSrc.value = payload.audioSrc ? payload.audioSrc : audioSrc;
    const chapter = getChapter(payload.audioID);
    if (selectedReciter.value) {
      // check for DB files return if audio found
      const audioStorage = await audioDB.getStorage(
        `${selectedReciter.value.id}-${payload.audioID}`
      );
      if (audioStorage) {
        audioFiles.value = {
          ...audioStorage,
          verse_timings: JSON.parse(audioStorage.verse_timings),
        };
        chapterId.value = payload.audioID;
        isLoading.value = false;
        return;
      }
      // stop the api call if audio files are already loaded
      // to chapter from prev api call
      if (
        chapter?.audioFile?.reciterId === selectedReciter.value.id &&
        chapter?.audioFile.chapter_id === payload.audioID
      ) {
        audioFiles.value = chapter.audioFile;
        isLoading.value = false;
        return;
      }

      await instance
        .get(audioRecitersUrl(selectedReciter.value?.id, payload.audioID))
        .then((response) => {
          audioFiles.value = {
            reciterId: selectedReciter.value?.id,
            ...response.data.audio_files[0],
          };
          // push audio chapter data
          if (chapter) {
            chapter.audioFile = {
              reciterId: selectedReciter.value?.id,
              ...response.data.audio_files[0],
            };
          }
        })
        .catch(async (error) => {
          await presentToast({ message: String(error) });
        })
        .finally(async () => {
          isLoading.value = false;
          const audioSettings: AudioPlayerSettings =
            await settingsDB.getStorage("audioSettings");
          if (audioSettings.autoDownload) {
            await downloadAudioFile();
          }
        });
    }
  };

  const getRecitations = async () => {
    // https://api.qurancdn.com/api/qdc/audio/reciters?locale=en
    await instance
      .get(recitationsUrl)
      .then((response) => {
        recitations.value = response.data.reciters;
      })
      .catch(async (error) => {
        await presentToast({ message: String(error) });
      });
  };

  const getRecition = async (reciter: Recitations) => {
    selectedReciter.value = reciter;
    if (chapterId.value) {
      await getAudio({ audioID: chapterId.value });
    } else {
      await getAudio({ audioID: Number(audioFiles.value?.chapter_id) });
    }
  };

  /**
   * play next chapter and loaddata when needed
   * @param audioSrc
   * @return void
   */
  const playNext = async (audioSrc?: string) => {
    if (chapterId.value) {
      chapterId.value =
        chapterId.value >= TOTAL_CHAPTERS ? 1 : chapterId.value + 1;
      // get the audio files
      await getAudio({ audioID: chapterId.value }, audioSrc);
    }
  };

  const playPrevious = async () => {
    if (chapterId.value) {
      chapterId.value = chapterId.value - 1;
      await getAudio({ audioID: chapterId.value });
    }
  };

  onMounted(async () => {
    await getRecitations();
  });

  onUnmounted(() => resetValues());

  watchEffect(() => {
    if (!selectedReciter.value) {
      const found = recitations.value.find((r) => r.reciter_id === 6);
      if (found) selectedReciter.value = found;
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

  // Start Audio Test
  const playbackPaused = () => {
    isPlaying.value = false;
    listenerActive.value = false;
  };

  const playbackPlaying = () => {
    isPlaying.value = true;
    listenerActive.value = true;
  };

  const downloadAudioFile = async () => {
    isLoading.value = true;
    if (audioFiles.value) {
      const audioUrl = audioFiles.value.audio_url;
      const key = `${String(audioFiles.value.reciterId)}-${
        audioFiles.value.chapter_id
      }`;
      await instance
        .get(audioUrl, {
          responseType: "blob",
        })
        .then(async (response) => {
          const base64Data = (await encodeBlobToBase64(
            response.data
          )) as string;
          audioDB.setStorage(key, {
            reciterId: String(audioFiles.value?.reciterId),
            id: audioFiles.value?.id,
            chapter_id: audioFiles.value?.chapter_id,
            file_size: audioFiles.value?.file_size,
            format: audioFiles.value?.format,
            duration: audioFiles.value?.duration,
            verse_timings: JSON.stringify(audioFiles.value?.verse_timings),
            audio_url: base64Data,
          });
        })
        .catch(async (error) => {
          await presentToast({ message: String(error) });
        })
        .finally(async () => {
          isLoading.value = false;
          presentAlert({
            header: String(selectedReciter.value?.name),
            subHeader: selectedReciter.value?.style.name,
            message: chapterName.value + " File has been downloaded!",
          });
        });
    }
  };

  const resetValues = () => {
    verseTiming.value = undefined;
    selectedVerseKey.value = "";
    chapterId.value = undefined;
    audioFiles.value = null;
    currentTimestamp.value = 0;
    isPlaying.value = false;
    listenerActive.value = false;
  };

  return {
    audioFiles,
    isLoading,
    playbackSpeeds,
    selectedReciter,
    recitations,
    chapterName,
    chapterId,
    autoStartPlayer,
    selectedVerseKey,
    mapRecitions,
    verseTiming,
    audioPayLoadSrc,
    getReciterNameInitials,
    avatarPlaceholder,
    playbackRate,
    listenerActive,
    progressTimer,
    elapsedTime,
    audioDuration,
    duration,
    mediaVolume,
    isPlaying,
    isMuted,
    loopAudio,
    isResumed,
    audioBuffer,
    currentTimestamp,
    audioPlayerSetting,
    isPaused,
    isVisible,
    resetValues,
    playbackPlaying,
    playbackPaused,
    getRecitations,
    getAudio,
    getRecition,
    playNext,
    playPrevious,
    downloadAudioFile,
  };
});
