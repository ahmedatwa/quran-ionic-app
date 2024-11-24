import { defineStore } from "pinia";
import { ref } from "vue";
import { Howl } from "howler";
// utils
import { milliSecondsToSeconds } from "@/utils/datetime";
import { useAudioStore } from "./AudioStore";

export const useHowlerPlayerStore = defineStore("howler-player-store", () => {
  const audioStore = useAudioStore();
  const isLoading = ref(false);
  const isLoaded = ref(false);
  const isPlayerVisible = ref(false);
  const sound = ref();
  const soundId = ref<number>();
  const isPlaying = ref(false);

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
    audioStore.mediaVolume = vol;
    await sound.value.volume(audioStore.mediaVolume / 100);
  };

  const seek = async (seekVal: number) => {
    const position = milliSecondsToSeconds(seekVal);
    if (soundId.value) {
      await sound.value.seek(position, soundId.value);
    }
  };

  const loop = async (value: string) => {
    if (soundId.value) {
      await sound.value.loop(value, soundId.value);
    }
  };

  // watch(
  //   () => audioStore.audioFiles,
  //   (file) => {
  //     // if (file) {
  //     //   howlFile(file.audio_url);
  //     // }
  //   }
  // );

  return {
    handlePlay,
    pause,
    changeVolume,
    mute,
    seek,
    loop,
    isLoading,
    sound,
    isLoaded,
    isPlaying,
    isPlayerVisible,
  };
});
