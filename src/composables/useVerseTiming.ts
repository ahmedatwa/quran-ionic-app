// mouse.js
import { shallowRef, computed, watchEffect, onUnmounted } from "vue";
// utils
import { secondsToMilliSeconds } from "@/utils/datetime";
import { getChapterIdfromKey } from "@/utils/verse";
import { makeWordLocation, getVerseNumberFromKey } from "@/utils/verse";
// stores
import { useAudioStore } from "@/stores/AudioStore";
import type { VerseTimingsProps, VerseTimingSegments } from "@/types/audio";

export const useVerseTiming = () => {
  const audioStore = useAudioStore();
  const verseTiming = shallowRef<VerseTimingsProps | undefined>();
  const audioPayLoadSrc = shallowRef<string | undefined>("");

  const isCurrentTimeInRange = (
    currentTimeValue: number,
    timestampFrom: number,
    timestampTo: number
  ) => currentTimeValue >= timestampFrom && currentTimeValue < timestampTo;

  // Store verse timings data retrived from API
  const verseTimingsMap = computed(() => {
    //console.log(audioStore.audioFiles);
    
    return audioStore.audioFiles?.verse_timings.map((vt) => {
      return {
        inRange: false,
        wordLocation: "",
        wordPosition: 0,
        verseNumber: 0,
        ...vt,
      };
    });
  });

  watchEffect(() => {
    if (audioStore.currentTimestamp) {
     // console.log(verseTimingsMap.value);

      const currentTime = Math.ceil(
        secondsToMilliSeconds(audioStore.currentTimestamp)
      );
      // Find current verse Key
      const currentVerseTimingData = verseTimingsMap.value?.find(
        (vt) =>
          currentTime >= vt.timestamp_from && currentTime <= vt.timestamp_to
      );
      if (currentVerseTimingData) {
        const isVerseInRange = isCurrentTimeInRange(
          currentTime,
          currentVerseTimingData.timestamp_from,
          currentVerseTimingData?.timestamp_to
        );

        if (isVerseInRange) {
          currentVerseTimingData.segments.map((vt: VerseTimingSegments) => {
            const isSegmentInRange = isCurrentTimeInRange(
              currentTime,
              vt[1],
              vt[2]
            );
            if (isSegmentInRange) {
              verseTiming.value = {
                chapterId: getChapterIdfromKey(
                  currentVerseTimingData.verse_key
                ),
                verseKey: currentVerseTimingData.verse_key,
                inRange: isSegmentInRange,
                verseNumber: getVerseNumberFromKey(
                  currentVerseTimingData.verse_key
                ),
                wordLocation: makeWordLocation(
                  currentVerseTimingData.verse_key,
                  vt[0]
                ),
                wordPosition: vt[0],
                // pageNumber: currentVerseTimingData.pageNumber,
                audioSrc: audioPayLoadSrc.value,
              };
              return;
            }
          });
        }
      }
    }
  });

  onUnmounted(() => (verseTiming.value = undefined));

  return { verseTimingsMap, verseTiming, audioPayLoadSrc };
};
