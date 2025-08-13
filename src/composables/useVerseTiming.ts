import { shallowRef, computed, watchEffect, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
// utils
import { secondsToMilliSeconds } from "@/utils/datetime";
import { getChapterIdfromKey } from "@/utils/verse";
import { makeWordLocation, getVerseNumberFromKey } from "@/utils/verse";
// stores
import { useAudioStore } from "@/stores/AudioStore";
import { useChapterStore } from "@/stores/ChapterStore";
// type
import type { VerseTimingsProps, VerseTimingSegments } from "@/types/audio";

export const useVerseTiming = () => {
  const { audioFiles, currentTimestamp } = storeToRefs(useAudioStore());
  const { getVerseByVerseKey } = useChapterStore();
  const verseTiming = shallowRef<VerseTimingsProps>();
  const audioPayLoadSrc = shallowRef<string | undefined>("");

  const isCurrentTimeInRange = (
    currentTimeValue: number,
    timestampFrom: number,
    timestampTo: number
  ) => currentTimeValue >= timestampFrom && currentTimeValue < timestampTo;

  // Store verse timings data retrived from API
  const verseTimingsMap = computed(() => {
    return audioFiles.value?.verse_timings.map((vt) => {
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
    if (currentTimestamp) {
      const currentTime = Math.ceil(
        secondsToMilliSeconds(currentTimestamp.value)
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
                audioSrc: audioPayLoadSrc.value,
              };
              return;
            }
          });
        }
      }
    }
  });

  const getCurrentVerseData = computed(() => {
    if (verseTiming.value) {
      const verseKey = verseTiming.value.verseKey;
      const verse = getVerseByVerseKey(verseKey);
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
          juzNumber: null,
          hizbNumber: null,
          pageNumber: null,
        };
      }
    }
  });

  onUnmounted(() => (verseTiming.value = undefined));

  return { verseTimingsMap, verseTiming, audioPayLoadSrc, getCurrentVerseData };
};
