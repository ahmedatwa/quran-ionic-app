import { computed, ref, Ref, toValue, watchEffect } from "vue";
// stores
import { useAudioStore } from "@/stores/AudioStore";
// utils
import { secondsToMilliSeconds } from "@/utils//datetime";
import { milliSecondsToSeconds } from "@/utils//datetime";

interface MediaMetadata {
  title: string;
  artist: string;
  album: string;
  artwork: {
    src: string;
    sizes: string;
    type: string;
  }[];
}

export const useMediaSession = (audioEl: Ref<HTMLAudioElement | undefined>) => {
  const audioStore = useAudioStore();
  const dataSession = ref<MediaMetadata | null>(null);
  const mediaMetadata = computed(() => dataSession.value);

  const setMediaSession = (data: MediaMetadata) => {
    dataSession.value = data;
  };

  watchEffect(() => {
    if (audioStore.audioFiles) {
      const el = toValue(audioEl);
      const mediaMetadataValue = toValue(mediaMetadata);

      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          ...mediaMetadataValue,
        });

        const handleSeek = (ev: MediaSessionActionDetails) => {
          if (el) {
            switch (ev.action) {
              case "seekforward":
                if (ev.seekOffset) {
                  el.currentTime = Math.min(
                    el.currentTime + ev.seekOffset,
                    el.duration
                  );
                }
                break;
              case "seekbackward":
                if (ev.seekOffset) {
                  el.currentTime = Math.max(el.currentTime - ev.seekOffset, 0);
                }
                break;
            }
          }
        };

        const handleNextTrack = async () => {
          await audioStore.playNext();
        };

        const handlePrevTrack = async () => {
          await audioStore.playPrevious();
        };

        const playbackSeek = (seekValue: number) => {
          if (el) {
            try {
              audioStore.progressTimer = seekValue;
              el.currentTime = milliSecondsToSeconds(seekValue);
            } catch (error) {
              throw error;
            }
          }
        };

        const handleSeekTo = (ev: MediaSessionActionDetails) => {
          if (ev.seekTime) {
            const time = secondsToMilliSeconds(ev.seekTime);
            playbackSeek(time);
          }
        };

        const handlePlay = async () => {
          await audioEl.value?.play();
          if (audioEl.value?.played) {
            audioStore.isPlaying = true;
            audioStore.isPaused = false;
          }
        };

        const handlePause = async () => {
          audioEl.value?.pause();
          if (audioEl.value?.paused) {
            audioStore.isPlaying = false;
            audioStore.isPaused = true;
          }
        };

        navigator.mediaSession.setActionHandler("seekforward", handleSeek);
        navigator.mediaSession.setActionHandler("seekbackward", handleSeek);
        navigator.mediaSession.setActionHandler("nexttrack", handleNextTrack);
        navigator.mediaSession.setActionHandler(
          "previoustrack",
          handlePrevTrack
        );
        navigator.mediaSession.setActionHandler("seekto", handleSeekTo);
        navigator.mediaSession.setActionHandler("play", handlePlay);
        navigator.mediaSession.setActionHandler("pause", handlePause);
      }
    }
  });

  return { setMediaSession };
};
