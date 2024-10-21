import { defineStore } from "pinia";
import { ref, onMounted, computed, watchEffect, onBeforeMount } from "vue";
import { Howl } from "howler";

//axios
import { instance } from "@/axios";
import { audioRecitersUrl, recitationsUrl } from "@/axios/url";
import { AVATAR_PLACEHOLDER_API } from "@/axios/url";
// types
import type { AudioFile, AudioPlayerSettings } from "@/types/audio";
import type { MapRecitions, PlayAudioEmit } from "@/types/audio";
import type { VerseTimingsProps, Recitations } from "@/types/audio";
import type { VerseTimings, VerseTimingSegments } from "@/types/audio";
// stores
import { useChapterStore } from "@/stores/ChapterStore";
import { useMetaStore } from "@/stores/MetaStore";
// utils
import { useStorage } from "@/utils/useStorage";
import { useBlob } from "@/utils/useBlob";
import { useAlert } from "@/utils/useAlert";
import { getLangFullLocale } from "@/utils/locale";
import { useLocale } from "@/utils/useLocale";
import { secondsFormatter, secondsToMilliSeconds } from "@/utils/datetime";
import { milliSecondsToSeconds } from "@/utils/datetime";
import { makeWordLocation, getVerseNumberFromKey } from "@/utils/verse";
import { getChapterIdfromKey } from "@/utils/verse";
import { useMediaSession } from "@/utils/useMediaSession";

export const useHowlerPlayerStore = defineStore("howler-player-store", () => {
  const isLoading = ref(false);
  const isLoaded = ref(false);
  const isPlayerVisible = ref(false);
  const sound = ref();
  const soundId = ref<number>();
  const audioFiles = ref<AudioFile | null>(null);
  const isPlaying = ref(false);
  const chapterId = ref<number>();
  const selectedVerseKey = ref<string | undefined>();
  const mediaVolume = ref(100);
  const selectedReciter = ref<Recitations>();
  const loopState = ref("none");
  const recitations = ref<Recitations[]>([]);
  const { presentToast, presentAlert } = useAlert();
  const { getChapterNameByChapterId, getChapter, TOTAL_CHAPTERS } =
    useChapterStore();

  // default : Mishari Rashid al-`Afasy
  const reciterId = computed(() => selectedReciter.value?.reciter_id || 7);

  const chapterName = computed(() => {
    if (chapterId.value) {
      const chapter = getChapterNameByChapterId(chapterId.value);
      if (chapter) {
        return chapter.nameSimple;
      }
    }
  });

  const getAudio = async (payload: PlayAudioEmit, audioSrc?: string) => {
    chapterId.value = payload.audioID;
    selectedVerseKey.value = payload.verseKey;

    await instance
      .get(audioRecitersUrl(reciterId.value, payload.audioID))
      .then((response) => {
        audioFiles.value = {
          reciterId: reciterId.value,
          ...response.data.audio_files[0],
        };
      })
      .catch(async (error) => {
        console.log(error);
      })
      .finally(async () => {
        if (audioFiles.value) {
          howlFile(audioFiles.value?.audio_url);
        }
      });
  };

  const howlFile = async (file: string) => {
    sound.value = new Howl({
      src: [file],
      volume: 1,
      onload: () => {
        isLoaded.value = true;
        isPlayerVisible.value = true;
        // sound.value.play();
      },
      onend: () => {
        console.log("Finished!");
        isPlaying.value = false;
      },
      onplay: () => {
        isPlaying.value = true;
      },
      onpause: () => {
        isPlaying.value = false;
      },
      onstop: () => {
        isPlaying.value = false;
      },
    });
  };

  const handlePlay = async () => {
    if (sound.value.state() === "loaded") {
      if (sound.value.playing(soundId.value)) {
        await sound.value.pause(soundId.value);
        isPlaying.value = false;
      } else {
        soundId.value = await sound.value.play();
        isPlaying.value = true;
      }
    }
  };

  const pause = async () => {
    if (sound.value.playing(soundId.value)) {
      await sound.value.pause(soundId.value);
      isPlaying.value = false;
    }
  };

  const mute = async () => {
    await sound.value.mute(soundId.value);
  };

  const changeVolume = async (vol: number) => {
    mediaVolume.value = vol;
    await sound.value.volume(mediaVolume.value / 100);
  };

  const seek = async (seekVal: number) => {
    const position = milliSecondsToSeconds(seekVal);
    if (soundId.value) {
      await sound.value.seek(position, soundId.value);
    }
  };

  const loop = async (value: string) => {
    console.log(value);

    if (soundId.value) {
      await sound.value.loop(value, soundId.value);
    }
  };

  const handleSelectedReciter = (reciter: Recitations) => {
    selectedReciter.value = reciter;
  };

  const playNext = async (__ev?: boolean) => {
    if (chapterId.value) {
      chapterId.value =
        chapterId.value >= TOTAL_CHAPTERS ? 1 : chapterId.value + 1;
      // get the audio files
      await getAudio({ audioID: chapterId.value });
    }
  };

  const playPrevious = async () => {
    if (chapterId.value) {
      chapterId.value = chapterId.value - 1;
      await getAudio({ audioID: chapterId.value });
    }
  };

  const playChapterAudio = async (audioID: number) => {
    await getAudio({ audioID });
  };
  const downloadAudioFile = async () => {
    // isLoading.value = true;
    // if (audioFiles.value) {
    //   const audioUrl = audioFiles.value.audio_url;
    //   const key = `${String(audioFiles.value.reciterId)}-${
    //     audioFiles.value.chapter_id
    //   }`;
    //   await instance
    //     .get(audioUrl, {
    //       responseType: "blob",
    //       onDownloadProgress: async (progressEvent) => {
    //         const { loaded, total } = progressEvent;
    //         if (total)
    //           downloadProgress.value = Math.round((loaded * 100) / total);
    //       },
    //     })
    //     .then(async (response) => {
    //       const base64Data = (await encodeBlobToBase64(
    //         response.data
    //       )) as string;
    //       audioDB.setStorage(key, {
    //         reciterId: String(audioFiles.value?.reciterId),
    //         id: audioFiles.value?.id,
    //         chapter_id: audioFiles.value?.chapter_id,
    //         file_size: audioFiles.value?.file_size,
    //         format: audioFiles.value?.format,
    //         duration: audioFiles.value?.duration,
    //         verse_timings: JSON.stringify(audioFiles.value?.verse_timings),
    //         audio_url: base64Data,
    //       });
    //     })
    //     .catch(async (error) => {
    //       await presentToast({ message: String(error) });
    //     })
    //     .finally(async () => {
    //       isLoading.value = false;
    //     });
    // }
  };

  const mapRecitions = computed((): MapRecitions | undefined => {
    if (recitations.value) {
      return recitations.value.reduce((o: any, i) => {
        (o[i.style.name as keyof typeof o] =
          o[i.style.name as keyof typeof o] || []).push(i);
        return o;
      }, {});
    }
  });

  // const getRecitations = async () => {
  //   // https://api.qurancdn.com/api/qdc/audio/reciters?locale=en
  //   await instance
  //     .get(recitationsUrl)
  //     .then((response) => {
  //       recitations.value = response.data.reciters;
  //     })
  //     .catch(async (error) => {
  //       await presentToast({ message: String(error) });
  //     });
  // };

  // onBeforeMount(async () => {
  //   await getRecitations();
  // });

  watchEffect(() => {
    if (!selectedReciter.value) {
      const found = recitations.value.find((r) => r.reciter_id === 6);
      if (found) selectedReciter.value = found;
    }
  });

  return {
    handlePlay,
    pause,
    changeVolume,
    getAudio,
    mute,
    seek,
    loop,
    handleSelectedReciter,
    playNext,
    playPrevious,
    playChapterAudio,
    downloadAudioFile,
    isLoading,
    mapRecitions,
    chapterName,
    loopState,
    selectedReciter,
    mediaVolume,
    sound,
    audioFiles,
    isLoaded,
    isPlaying,
    chapterId,
    isPlayerVisible,
  };
});
