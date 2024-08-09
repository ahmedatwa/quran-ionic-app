import { defineStore } from "pinia";
import { ref, onMounted, computed, watchEffect } from "vue";
//axios
import { instance } from "@/axios";
import { audioRecitersUrl, recitationsUrl } from "@/axios/url";
import { AVATAR_PLACEHOLDER_API } from "@/axios/url";
// types
import type { AudioFile, Recitations, VerseTimings } from "@/types/audio";
import type { MapRecitions, PlayAudioEmit } from "@/types/audio";
import type { VerseTimingsProps } from "@/types/audio";
// stores
import { useChapterStore } from "@/stores/ChapterStore";
import { useSettingStore } from "@/stores/SettingStore";
// utils
import { useStorage } from "@/utils/useStorage";

export const useAudioPlayerStore = defineStore("audio-player-store", () => {
  const settingStore = useSettingStore();

  const { getChapterNameByChapterId, TOTAL_CHAPTERS, getChapter } =
    useChapterStore();
  const isLoading = ref(false);
  const { getStorage, setStorage } = useStorage("__audio");
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
      const audioDB = await getStorage(
        `${selectedReciter.value.id}-${payload.audioID}`
      );
      if (audioDB) {
        audioFiles.value = {
          ...audioDB,
          verse_timings: JSON.parse(audioDB.verse_timings),
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
        .finally(() => {
          isLoading.value = false;
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
      settingStore.isAppLoading = true;

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

    // const userSettings = getStorage("user-setting");
    // if (userSettings) {
    //   audioPlayerSetting.value = userSettings;
    // } else {
    //   setStorage("user-setting", audioPlayerSetting.value);
    // }
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
  };
});
