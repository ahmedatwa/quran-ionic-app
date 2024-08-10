import { defineStore } from "pinia";
import { ref, onMounted, computed, watchEffect } from "vue";
import { alertController } from "@ionic/vue";
//axios
import { instance } from "@/axios";
import { audioRecitersUrl, recitationsUrl } from "@/axios/url";
import { AVATAR_PLACEHOLDER_API } from "@/axios/url";
// types
import type {
  AudioFile,
  AudioPlayerSettings,
  Recitations,
} from "@/types/audio";
import type { MapRecitions, PlayAudioEmit } from "@/types/audio";
import type { VerseTimingsProps } from "@/types/audio";
// stores
import { useChapterStore } from "@/stores/ChapterStore";
// utils
import { useStorage } from "@/utils/useStorage";
import { useBlob } from "@/utils/useBlob";

export const useAudioPlayerStore = defineStore("audio-player-store", () => {
  const { getChapterNameByChapterId, TOTAL_CHAPTERS, getChapter } =
    useChapterStore();
  const isLoading = ref(false);
  const settingsDB = useStorage("__settingsDB");
  const audioDB = useStorage("__audioDB");
  const { encodeBlobToBase64 } = useBlob();

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
        return;
      }

      const chapter = getChapter(payload.audioID);
      chapterId.value = payload.audioID;
      selectedVerseKey.value = payload.verseKey;
      audioPayLoadSrc.value = payload.audioSrc ? payload.audioSrc : audioSrc;
      // stop the api call if audio files are already loaded
      // to chapter from prev api call
      if (
        chapter?.audioFile?.reciterId === selectedReciter.value.id &&
        chapter?.audioFile.chapter_id === payload.audioID
      ) {
        audioFiles.value = chapter.audioFile;
        return;
      }

      isLoading.value = true;
      await instance
        .get(audioRecitersUrl(selectedReciter.value?.id, payload.audioID))
        .then((response) => {
          // this triggers verseTiming computed func in audioPlayer Component
          audioFiles.value = null;
          verseTiming.value = undefined;
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
        .catch((e) => {
          throw e;
        })
        .finally(async () => {
          isLoading.value = false;
          const audioSettings: AudioPlayerSettings =
            await settingsDB.getStorage("audioSettings");
          if (audioSettings.autoDownload) {
            downloadAudioFile();
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
      .catch((e) => {
        throw e;
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

  const downloadAudioFile = () => {
    if (audioFiles.value) {
      const audioUrl = audioFiles.value.audio_url;
      const key = `${String(audioFiles.value.reciterId)}-${
        audioFiles.value.chapter_id
      }`;
      instance
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
        .finally(async () => {
          isDownloadSuccess.value = true;
          const alert = await alertController.create({
            header: selectedReciter.value?.name,
            subHeader: selectedReciter.value?.style.name,
            message: chapterName.value + " File has been downloaded!",
            buttons: ["Ok"],
          });

          await alert.present();
        });
    }
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
    audioBuffer,
    currentTimestamp,
    audioPlayerSetting,
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
