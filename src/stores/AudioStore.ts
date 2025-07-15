import { defineStore } from "pinia";
import { ref, onBeforeMount, computed } from "vue";
// types
import type { AudioFile, AudioPlayerSettings } from "@/types/audio";
import type { PlayAudioEmit } from "@/types/audio";
import type { Chapter } from "@/types/chapter";
// stores
import { useMetaStore } from "@/stores/MetaStore";
import { useRecitionsStore } from "@/stores/RecitionsStore";
import { useChapterStore } from "@/stores/ChapterStore";
// utils
import { getLangFullLocale } from "@/utils/locale";
import { secondsFormatter, secondsToMilliSeconds } from "@/utils/datetime";
import { milliSecondsToSeconds } from "@/utils/datetime";
// composables
import { useMediaSession } from "@/composables/useMediaSession";
import { useAudioFile } from "@/composables/useAudioFile";
import { useStorage } from "@/composables/useStorage";
import { useAlert } from "@/composables/useAlert";
import { useLocale } from "@/composables/useLocale";
import { useVerseTiming } from "@/composables/useVerseTiming";
// router
import { useRouter } from "vue-router";

export const useAudioStore = defineStore("audio-store", () => {
  const audioEl = ref<HTMLAudioElement>();
  const { downloadAudioFile } = useAudioFile();
  const { verseTiming } = useVerseTiming();
  const metaStore = useMetaStore();
  const recitionsStore = useRecitionsStore();
  const { setMediaSession } = useMediaSession(audioEl);
  const chapterStore = useChapterStore();
  const isVisible = ref(false);
  const isLoading = ref(false);
  const settingsDB = useStorage("__settingsDB");
  const audioDB = useStorage("__audioDB");
  const { presentToast, presentAlert, presentLoading } = useAlert();
  const audioFiles = ref<AudioFile | null>(null);
  const autoStartPlayer = ref(false);
  const chapterId = ref<number>();
  const audioPayLoadSrc = ref<string | undefined>("");
  const selectedVerseKey = ref<string | undefined>("");
  const { getLocale } = useLocale();
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

  const playbackRate = ref("Normal");
  const listenerActive = ref(false);
  const progressTimer = ref<number>(0);
  const elapsedTime = ref("00:00");
  const audioDuration = ref("");
  const duration = ref(0);
  const mediaVolume = ref(100);
  const isPlaying = ref(false);
  const isMuted = ref(false);
  const isPaused = ref(false);
  const isResumed = ref(false);
  const loopAudio = ref("none");
  const audioBuffer = ref();
  const currentTimestamp = ref(0);
  const audioPlayerSetting = ref({
    autoPlay: true,
    dismissOnEnd: false,
    autoScroll: true,
    tooltip: false,
    fab: true,
    autoDownload: true,
    volume: 100,
    loopAudio: "none",
  });
  const recentlyPlayed = ref<number[]>([]);
  const { replace } = useRouter();

  const chapterName = computed(() => {
    if (chapterId.value) {
      const chapter = chapterStore.getChapterNameByChapterId(chapterId.value);
      if (chapter) {
        return chapter.nameSimple;
      }
    }
  });

  const getAudio = async (payload: PlayAudioEmit, audioSrc?: string) => {
    isLoading.value = true;
    isVisible.value = true;
    chapterId.value = payload.audioID;
    selectedVerseKey.value = payload.verseKey;
    audioPayLoadSrc.value = payload.audioSrc ? payload.audioSrc : audioSrc;

    if (recitionsStore.selectedReciter) {
      const chapter = chapterStore.getChapter(payload.audioID);
      // check for DB files return if audio found
      const audioStorage = await audioDB.getStorage(
        `${recitionsStore.selectedReciter.id}-${payload.audioID}`
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
        chapter?.audioFile?.reciterId === recitionsStore.selectedReciter.id &&
        chapter?.audioFile.chapter_id === payload.audioID
      ) {
        audioFiles.value = chapter.audioFile;
        isLoading.value = false;
        return;
      }

      audioFiles.value = null;
      await loadAudioFromJSON(
        recitionsStore.selectedReciter?.id.toString(),
        payload.audioID.toString()
      )
        .then((response) => {
          audioFiles.value = {
            reciterId: recitionsStore.selectedReciter?.id,
            ...response[0],
          };
          // push audio chapter data
          if (chapter) {
            chapter.audioFile = {
              reciterId: recitionsStore.selectedReciter?.id,
              ...response[0],
            };
          }
        })
        .catch(async (e) => {
          await presentToast({ message: String(e) });
        })
        .finally(async () => {
          isLoading.value = false;
          const audioSettings: AudioPlayerSettings =
            await settingsDB.getStorage("audioSettings");
          if (audioSettings.autoDownload) {
           if(audioFiles.value) await downloadAudioFile(audioFiles.value);
          }
          // Store recelty played
          if (!recentlyPlayed.value.includes(payload.audioID)) {
            recentlyPlayed.value.push(payload.audioID);
          }

          await settingsDB.setStorage(
            "recently-played",
            JSON.stringify(recentlyPlayed.value)
          );
        });
    }
  };

  // Load Audio JSON Data
  const loadAudioFromJSON = (
    reciterId: string,
    audioID: string
  ): Promise<AudioFile[]> => {
    return new Promise((resolve, reject) => {
      try {
        import(`@jsonDataPath/audio/${reciterId}/${audioID}.json`).then(
          (response) => resolve(response.audio_files)
        );
      } catch (error) {
        reject(error);
      }
    });
  };
  /**
   * play next chapter and loaddata when needed
   * @param audioSrc
   * @return void
   */
  const playNext = async (__ev?: boolean) => {
    if (chapterId.value) {
      chapterId.value =
        chapterId.value >= chapterStore.TOTAL_CHAPTERS
          ? 1
          : chapterId.value + 1;
      // get the audio files
      await getAudio({ audioID: chapterId.value });
      await presentLoading();
      // store selected chapter into chapterStore
      const chapter = chapterStore.chaptersList?.find(
        (c) => c.id === chapterId.value
      );
      if (chapter) {
        chapterStore.selectedChapter = chapter;
        // route to chapter for data to be fetched
        replace(`/chapter/${chapter.id}/${chapter.slug}`);
        await presentLoading(true);
      }
    }
  };

  const playPrevious = async () => {
    if (chapterId.value) {
      chapterId.value = chapterId.value - 1;
      await getAudio({ audioID: chapterId.value });
      // store selected chapter into chapterStore
      const chapter = chapterStore.chaptersList?.find(
        (c) => c.id === chapterId.value
      );
      if (chapter) chapterStore.selectedChapter = chapter;
    }
  };

  onBeforeMount(async () => {
    const audioStorage = await settingsDB.getStorage("audioSettings");
    if (audioStorage) {
      audioPlayerSetting.value = audioStorage;
      loopAudio.value = audioPlayerSetting.value.loopAudio;
      mediaVolume.value = audioPlayerSetting.value.volume;
    }
    const recent = await settingsDB.getStorage("recently-played");
    if (recent) {
      recentlyPlayed.value = JSON.parse(recent);
    }
  });

  // Start Audio Test
  const playbackPaused = () => {
    isPlaying.value = false;
    listenerActive.value = false;
  };

  const playbackPlaying = (_ev: Event) => {
    isPlaying.value = true;
    listenerActive.value = true;
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

  // Start
  const playAudio = async () => {
    await audioEl.value?.play();
    isPlaying.value = true;
    isPaused.value = false;
  };

  const pauseAudio = async () => {
    audioEl.value?.pause();
    isPlaying.value = false;
    isPaused.value = true;
    // Store Last reading verse
    await settingsDB.setStorage("lastreadingverse", {
      ...verseTiming.value,
    });
  };

  const changeMediaVolume = async (volume: number) => {
    if (audioEl.value) {
      mediaVolume.value = volume;
      audioEl.value.volume = mediaVolume.value / 100;
      await settingsDB.setStorage("audioSettings", {
        ...audioPlayerSetting.value,
        volume: volume,
      });
    }
  };

  const playbackSeek = (seekValue: number) => {
    if (audioEl.value) {
      progressTimer.value = seekValue;
      audioEl.value.currentTime = milliSecondsToSeconds(seekValue);
    }
  };

  const handlePlay = async (
    ev: { audioID: number; verseKey?: string } | boolean
  ) => {
    if (typeof ev === "object") {
      selectedVerseKey.value = ev.verseKey;
      loadedData();
    } else {
      isPlaying.value ? pauseAudio() : playAudio();
    }
  };

  const canPlayThrough = () => {
    if (audioFiles.value)
      audioDuration.value = secondsFormatter(
        Math.round(audioFiles.value.duration)
      );
    if (audioEl.value) {
      audioEl.value.volume = mediaVolume.value / 100;
    }
  };

  const loadedData = () => {
    isLoading.value = true;
    if (audioEl.value) {
      if (audioEl.value.readyState > 2) {
        // Verse Play
        if (selectedVerseKey) {
          const verseTiming = audioFiles.value?.verse_timings.find(
            (vt) => vt.verse_key === selectedVerseKey.value
          );

          if (verseTiming) {
            if (audioEl.value) {
              audioEl.value.currentTime = milliSecondsToSeconds(
                verseTiming.timestamp_from
              );
              progressTimer.value = secondsToMilliSeconds(
                verseTiming.timestamp_from / verseTiming.timestamp_to
              );
            }
          }
        }
        isLoading.value = false;
      } else {
        presentAlert({ message: "Failed to fetch Audio", header: "Error" });
      }
    }
  };

  const loadMetaData = () => {
    if (chapterName.value) {
      metaStore.setPageTitle(chapterName.value);
      metaStore.setMetaData([
        { property: "og:audio:title", content: chapterName.value },
        { name: "twitter:title", content: chapterName.value },
        { property: "og:title", content: chapterName.value },
      ]);
    }

    if (audioFiles) {
      metaStore.setMetaData([
        {
          property: "music:song:track",
          content: String(audioFiles.value?.id),
        },
        {
          property: "og:url",
          content: audioFiles.value?.audio_url as string,
        },
        {
          property: "og:type",
          content: audioFiles.value?.format as string,
        },
        {
          property: "og:audio",
          content: String(audioFiles.value?.audio_url),
        },
        {
          property: "music:duration",
          content: String(audioFiles.value?.duration),
        },
        {
          property: "og:audio:type",
          content: audioFiles.value?.format as string,
        },
      ]);
    }

    if (recitionsStore.selectedReciter) {
      metaStore.setMetaData([
        {
          name: "twitter:image",
          content: `/reciters/${recitionsStore.selectedReciter?.reciter_id}.jpg`,
        },
        {
          property: "music:musician",
          content: String(recitionsStore.selectedReciter?.name),
        },
        {
          property: "og:audio:artist",
          content: String(recitionsStore.selectedReciter?.name),
        },
        {
          property: "og:image",
          content: `/reciters/${recitionsStore.selectedReciter?.reciter_id}.jpg`,
        },
      ]);

      // Media Controls
      setMediaSession({
        title: String(chapterName.value),
        artist: String(recitionsStore.selectedReciter?.name),
        album: "Quran",
        artwork: [
          {
            src: `/reciters/${recitionsStore.selectedReciter?.reciter_id}.jpg`,
            sizes: "96x96",
            type: "image/jpg",
          },
        ],
      });
    }
  };

  const cleanupListeners = () => {
    listenerActive.value = false;
    isPlaying.value = false;
    audioEl.value?.removeEventListener("timeupdate", playbackListener);
    audioEl.value?.removeEventListener("ended", playbackEnded);
    audioEl.value?.removeEventListener("pause", playbackPaused);
    //verseTiming.value = undefined;
  };

  const playbackListener = () => {
    if (audioEl.value) {
      if (audioFiles.value) {
        listenerActive.value = true;
        currentTimestamp.value = audioEl.value.currentTime;
        duration.value = milliSecondsToSeconds(audioFiles.value.duration);
        elapsedTime.value = secondsFormatter(
          duration.value - (currentTimestamp.value - 1),
          getLangFullLocale(getLocale.value)
        );
        progressTimer.value = secondsToMilliSeconds(currentTimestamp.value - 1);
      }
    }
  };

  const playbackEnded = async () => {
    switch (loopAudio.value) {
      case "once":
        if (audioEl.value) {
          audioEl.value.currentTime = 0;
          isPlaying.value = true;
          await audioEl.value.play();
        }
        break;
      case "repeat":
        await playNext();
        break;
      case "none":
        isPlaying.value = false;
        isPaused.value = true;
        listenerActive.value = false;
        // verseTiming.value = undefined;
        cleanupListeners();
        // dismiss on playbavc ends
        if (audioPlayerSetting.value.dismissOnEnd) {
          closePlayer();
        }
        break;
    }
  };

  const closePlayer = () => {
    if (audioEl.value) {
      audioEl.value.pause();
    }
    chapterId.value = 0;
    audioFiles.value = null;
    selectedVerseKey.value = "";
    cleanupListeners();
  };

  const handleAudioSetting = async (ev: CustomEvent) => {
    const audio: { checked: boolean; value: string } = ev.detail;
    switch (audio.value) {
      case "autoPlay":
        audioPlayerSetting.value.autoPlay = audio.checked;
        break;
      case "dismissOnEnd":
        audioPlayerSetting.value.dismissOnEnd = audio.checked;
        break;
      case "autoScroll":
        audioPlayerSetting.value.autoScroll = audio.checked;
        break;
      case "autoDownload":
        audioPlayerSetting.value.autoDownload = audio.checked;
        break;
      case "fab":
        audioPlayerSetting.value.fab = audio.checked;
        break;
    }

    await settingsDB.setStorage("audioSettings", audioPlayerSetting);
  };

  const setLoopAudio = async (event: string) => {
    if (event) {
      loopAudio.value = event;
      audioPlayerSetting.value.autoPlay;
      await settingsDB.setStorage("audioSettings", {
        ...audioPlayerSetting.value,
        loop: event,
      });
    }
  };

  const playChapterAudio = async (audioID: number) => {
    await getAudio({ audioID });
  };

  const getRecentlyPlayed = computed(() => {
    let cs: Chapter[] = [];
    if (recentlyPlayed.value) {
      recentlyPlayed.value.forEach((chapterId) => {
        const chapter = chapterStore.chaptersList?.find(
          (c) => c.id === chapterId
        );
        if (chapter) cs.push({ ...chapter });
      });
    }
    return cs;
  });

  const clearAudioStoragecache = async () => {
    await audioDB.clearStorage();
  };

  return {
    audioEl,
    audioFiles,
    isLoading,
    playbackSpeeds,
    chapterName,
    chapterId,
    autoStartPlayer,
    selectedVerseKey,
    audioPayLoadSrc,
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
    recentlyPlayed,
    getRecentlyPlayed,
    setLoopAudio,
    playAudio,
    pauseAudio,
    changeMediaVolume,
    playbackSeek,
    handlePlay,
    loadedData,
    canPlayThrough,
    playbackEnded,
    playbackListener,
    loadMetaData,
    handleAudioSetting,
    playChapterAudio,
    resetValues,
    playbackPlaying,
    playbackPaused,
    getAudio,
    playNext,
    playPrevious,
    downloadAudioFile,
    clearAudioStoragecache,
  };
});
