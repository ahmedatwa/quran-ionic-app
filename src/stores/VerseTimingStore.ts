import { shallowRef, computed, watchEffect, onUnmounted } from "vue";
import { defineStore } from "pinia";
// utils
import { secondsToMilliSeconds } from "@/utils/datetime";
import { getChapterIdfromKey } from "@/utils/verse";
import { makeWordLocation, getVerseNumberFromKey } from "@/utils/verse";
// stores
import { useAudioStore } from "@/stores/AudioStore";
import { useChapterStore } from "@/stores/ChapterStore";
// type
import type { VerseTimingsProps, VerseTimingSegments } from "@/types/audio";
import type { VerseHeaderDataReturn } from "@/types/verse";

export const useVerseTimingStore = defineStore("versetiming-store", () => {
  const audioStore = useAudioStore();
  const chapterStore = useChapterStore();
  const verseTiming = shallowRef<VerseTimingsProps>();

  const isCurrentTimeInRange = (
    currentTimeValue: number,
    timestampFrom: number,
    timestampTo: number
  ) => currentTimeValue >= timestampFrom && currentTimeValue < timestampTo;

  // Store verse timings data retrived from API
  const verseTimingsMap = computed(() => {
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
                audioSrc: audioStore.audioPayLoadSrc,
                duration: currentVerseTimingData.duration,
                
              };
              return;
            }
          });
        }
      }
    }
  });

  const activeComputedChapterId = computed(() => {
    if (verseTiming.value) {
      return verseTiming.value.chapterId;
    }
  });
  const activeComputedVerseKey = computed(() => {
    if (verseTiming.value) {
      return verseTiming.value.verseKey;
    }
  });

  const getCurrentVerseHeaderData = computed((): VerseHeaderDataReturn | undefined => {
    if (verseTiming.value) {
      const verse = chapterStore.getVerseByVerseKey(verseTiming.value.verseKey);
      if (verse) {
        return {
          juzNumber: verse.juz_number,
          hizbNumber: verse.hizb_number,
          pageNumber: verse.page_number,
          surah: verseTiming.value.chapterId,
          ayah: verseTiming.value.verseNumber,
        };
      } else {
        return {
          surah: verseTiming.value.chapterId,
          ayah: verseTiming.value.verseNumber,
        };
      }
    }
  });

  onUnmounted(() => (verseTiming.value = undefined));

  return {
    activeComputedChapterId,
    activeComputedVerseKey,
    verseTimingsMap,
    verseTiming,
    getCurrentVerseHeaderData,
  };
});
