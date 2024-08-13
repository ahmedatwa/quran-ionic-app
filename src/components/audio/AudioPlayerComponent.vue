<script lang="ts" setup>
import { ref, watchEffect, computed, onUnmounted } from "vue"
import { IonToolbar, IonFooter, IonButtons, IonAvatar } from '@ionic/vue';
import { IonIcon, IonButton, IonSpinner, IonChip, IonLabel } from '@ionic/vue';
import { playOutline, playForwardOutline, pauseOutline, closeOutline } from 'ionicons/icons';
// components
import AudioPlayerModalComponent from '@/components/audio/AudioPlayerModalComponent.vue';
// utils
import { secondsFormatter, milliSecondsToSeconds, secondsToMilliSeconds } from "@/utils/datetime"
import { getLangFullLocale } from "@/utils/locale"
import { useLocale } from "@/utils/useLocale"
import { makeWordLocation, getVerseNumberFromKey, getChapterIdfromKey } from "@/utils/verse"
// types
import type { VerseTimings, VerseTimingSegments, Recitations } from "@/types/audio"
// stores
import { useMetaStore } from "@/stores/MetaStore";
import { useAudioPlayerStore } from '@/stores/AudioPlayerStore';

const audioPlayerStore = useAudioPlayerStore()
const metaStore = useMetaStore();
const audioPlayerRef = ref<HTMLAudioElement>()
const { getLocale } = useLocale()


defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits<{
    "update:modelValue": [value: boolean]
}>()

const playAudio = () => {
    if (audioPlayerRef.value) {
        if (audioPlayerRef.value.paused) {
            audioPlayerRef.value.play();
            audioPlayerStore.isPlaying = true;
        } else {
            audioPlayerRef.value.pause();
            audioPlayerStore.isPlaying = false;
        }
    }
};

const onProgress = () => {
    if (
        audioPlayerRef.value?.buffered &&
        audioPlayerRef.value.buffered.length
    ) {
        const lastIndex = audioPlayerRef.value.buffered.length - 1;
        return audioPlayerRef.value.buffered.end(lastIndex);
        // audioBuffer.value = timestamp *100
    }

    return 0;
};

const playbackListener = () => {
    if (audioPlayerRef.value) {
        if (audioPlayerStore.audioFiles) {
            audioPlayerStore.listenerActive = true;
            audioPlayerStore.currentTimestamp = audioPlayerRef.value.currentTime;
            audioPlayerStore.duration = milliSecondsToSeconds(
                audioPlayerStore.audioFiles.duration
            );
            audioPlayerStore.elapsedTime = secondsFormatter(
                audioPlayerStore.duration - (audioPlayerStore.currentTimestamp - 1),
                getLangFullLocale(getLocale.value)
            );
            audioPlayerStore.progressTimer = secondsToMilliSeconds(audioPlayerStore.currentTimestamp - 1);
        }
    }
};

const playbackEnded = async () => {
    switch (audioPlayerStore.loopAudio) {
        case "once":
            if (audioPlayerRef.value) {
                audioPlayerRef.value.currentTime = 0;
                audioPlayerStore.isPlaying = true;
                audioPlayerRef.value?.play();
            }
            break;
        case "repeat":
            await audioPlayerStore.playNext();
            break;
        case "none":
            audioPlayerStore.isPlaying = false;
            audioPlayerStore.listenerActive = false;

            cleanupListeners();
            // dismiss on playbavc ends
            if (audioPlayerStore.audioPlayerSetting.dismissOnEnd) {
                closePlayer()
            }

            break;
    }
    //
};

//Remove listeners after audio play stops
const cleanupListeners = () => {
    audioPlayerStore.listenerActive = false;
    audioPlayerStore.isPlaying = false;
    audioPlayerRef.value?.removeEventListener("timeupdate", playbackListener);
    audioPlayerRef.value?.removeEventListener("ended", playbackEnded);
    audioPlayerRef.value?.removeEventListener("pause", audioPlayerStore.playbackPaused);
};

const canPlayThrough = () => {
    if (audioPlayerStore.audioFiles)
        audioPlayerStore.audioDuration = secondsFormatter(
            Math.round(audioPlayerStore.audioFiles.duration)
        );
    if (audioPlayerRef.value) {
        audioPlayerRef.value.volume = audioPlayerStore.mediaVolume;
    }
};

const loadedData = () => {
    audioPlayerStore.isLoading = true;
    if (audioPlayerRef.value) {
        if (audioPlayerRef.value.readyState > 2) {
            // Verse Play
            if (audioPlayerStore.selectedVerseKey) {
                const verseTiming = audioPlayerStore.audioFiles?.verse_timings.find(
                    (vt) => vt.verse_key === audioPlayerStore.selectedVerseKey
                );

                if (verseTiming) {
                    if (audioPlayerRef.value) {
                        audioPlayerRef.value.currentTime = milliSecondsToSeconds(
                            verseTiming.timestamp_from
                        );
                        audioPlayerStore.progressTimer = secondsToMilliSeconds(
                            verseTiming.timestamp_from / verseTiming.timestamp_to
                        );
                    }
                }
            }
            audioPlayerStore.isLoading = false;
        } else {
            throw "Failed to fetch Audio";
        }
    }
};

const playbackSeek = (seekValue: number) => {
    if (audioPlayerRef.value) {
        audioPlayerStore.progressTimer = seekValue
        audioPlayerRef.value.currentTime = seekValue / 1000
    }
};

const loadMetaData = () => {
    if (audioPlayerStore.chapterName) {
        metaStore.setPageTitle(audioPlayerStore.chapterName);
        metaStore.setMetaData([
            { property: "og:audio:title", content: audioPlayerStore.chapterName },
            { name: "twitter:title", content: audioPlayerStore.chapterName },
            { property: "og:title", content: audioPlayerStore.chapterName },
        ]);
    }

    if (audioPlayerStore.audioFiles) {
        metaStore.setMetaData([
            {
                property: "music:song:track",
                content: String(audioPlayerStore.audioFiles.id),
            },
            {
                property: "og:url",
                content: audioPlayerStore.audioFiles.audio_url as string,
            },
            {
                property: "og:type",
                content: audioPlayerStore.audioFiles.format as string,
            },
            {
                property: "og:audio",
                content: audioPlayerStore.audioFiles.audio_url,
            },
            {
                property: "music:duration",
                content: audioPlayerStore.audioFiles.duration.toString(),
            },
            {
                property: "og:audio:type",
                content: audioPlayerStore.audioFiles.format as string,
            },
        ]);
    }

    if (audioPlayerStore.selectedReciter) {
        metaStore.setMetaData([
            {
                name: "twitter:image",
                content: `/reciters/${audioPlayerStore.selectedReciter.reciter_id
                    }.jpg`,
            },
            {
                property: "music:musician",
                content: audioPlayerStore.selectedReciter.name,
            },
            {
                property: "og:audio:artist",
                content: audioPlayerStore.selectedReciter.name,
            },
            {
                property: "og:image",
                content: `/reciters/${audioPlayerStore.selectedReciter.reciter_id}.jpg`,
            },
        ]);


        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: audioPlayerStore.chapterName,
                artist: audioPlayerStore.selectedReciter.name,
                album: "Quran",
                artwork: [
                    {
                        src: `/reciters/${audioPlayerStore.selectedReciter.reciter_id}.jpg`,
                        sizes: "96x96",
                        type: "image/jpg",
                    },
                ],
            });

            navigator.mediaSession.setActionHandler("play", () => {
                playAudio();
            });
            navigator.mediaSession.setActionHandler("pause", () => {
                playAudio();
            });

            navigator.mediaSession.setActionHandler("seekto", ({ seekTime }) => {
                if (seekTime) {
                    audioPlayerStore.progressTimer = secondsToMilliSeconds(seekTime);
                    playbackSeek(seekTime);
                }
            });

            // Play next
            navigator.mediaSession.setActionHandler("nexttrack", () => {
                audioPlayerStore.playNext()
            });
            // Play prev
            navigator.mediaSession.setActionHandler("previoustrack", () => {
                audioPlayerStore.playPrevious();
            });
        }
    }

    // controls for android 

}

const isCurrentTimeInRange = (currentTimeValue: number, timestampFrom: number, timestampTo: number) =>
    currentTimeValue >= timestampFrom && currentTimeValue < timestampTo;


// get verse timing
const getVerseTiming = computed((): VerseTimings[] | undefined => {
    if (audioPlayerStore.audioFiles) {
        return audioPlayerStore.audioFiles.verse_timings.map((vt) => {
            return {
                inRange: false,
                wordLocation: "",
                wordPosition: 0,
                verseNumber: 0,
                ...vt
            }
        })
    }
})

watchEffect(() => {
    if (getVerseTiming) {
        const currentTime = Math.ceil(secondsToMilliSeconds(audioPlayerStore.currentTimestamp))
        // Find current verse Key 
        const currentVerseTimingData = getVerseTiming.value?.find((vt) => currentTime >= vt.timestamp_from && currentTime <= vt.timestamp_to)
        if (currentVerseTimingData) {
            const isVerseInRange = isCurrentTimeInRange(currentTime, currentVerseTimingData.timestamp_from, currentVerseTimingData?.timestamp_to)

            if (isVerseInRange) {
                currentVerseTimingData.segments.map((vt: VerseTimingSegments) => {

                    const isSegmentInRange = isCurrentTimeInRange(currentTime, vt[1], vt[2])
                    if (isSegmentInRange) {
                        audioPlayerStore.verseTiming = {
                            chapterId: getChapterIdfromKey(currentVerseTimingData.verse_key),
                            verseKey: currentVerseTimingData.verse_key,
                            inRange: isSegmentInRange,
                            verseNumber: getVerseNumberFromKey(currentVerseTimingData.verse_key),
                            wordLocation: makeWordLocation(currentVerseTimingData.verse_key, vt[0]),
                            wordPosition: vt[0],
                            audioSrc: audioPlayerStore.audioPayLoadSrc
                        }
                        return;
                    }
                })
            }
        }
    }
})

onUnmounted(() => {
    audioPlayerStore.audioFiles = null
})

const closePlayer = () => {
    emit('update:modelValue', false)
    if (audioPlayerRef.value) {
        audioPlayerRef.value.pause();
    }
    audioPlayerStore.chapterId = 0
    audioPlayerStore.audioFiles = null
    audioPlayerStore.selectedVerseKey = ""
    cleanupListeners()
}

const changeMediaVolume = async (volume: number) => {
    if (audioPlayerRef.value) {
        audioPlayerStore.mediaVolume = volume
        audioPlayerRef.value.volume = audioPlayerStore.mediaVolume / 100
    }
}

const playChapterAudio = (audioID: number) => {
    audioPlayerStore.getAudio({ audioID })
}

const handleSelectedReciter = (reciter: Recitations) => {
    audioPlayerStore.selectedReciter = reciter
}

const playNext = (ev: boolean) => {
    console.log(ev);

    audioPlayerStore.playNext()
}

</script>

<template>
    <Transition name="slide-fade">
        <ion-footer v-if="modelValue" class="footer">
            <ion-toolbar>
                <div id="audio-modal">
                    <ion-chip :outline="true" class="reciter-chip">
                    <ion-avatar>
                        <img :alt="audioPlayerStore.selectedReciter?.name" class="img"
                            :src="`/reciters/${audioPlayerStore.selectedReciter?.reciter_id}.jpg`" />
                    </ion-avatar>
                    <ion-label color="medium">{{ audioPlayerStore.chapterName }}</ion-label>
                </ion-chip>
                </div>
                <ion-buttons slot="end">
                    <ion-button fill="clear" @click="playAudio" size="small">
                        <ion-spinner v-if="audioPlayerStore.isLoading"></ion-spinner>
                        <ion-icon slot="icon-only" :icon="audioPlayerStore.isPlaying ? pauseOutline : playOutline"
                            v-else></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" @click="audioPlayerStore.playNext" size="small">
                        <ion-icon slot="icon-only" :icon="playForwardOutline"></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" @click="closePlayer" size="small">
                        <ion-icon slot="icon-only" :icon="closeOutline" color="danger"></ion-icon>
                    </ion-button>
                </ion-buttons>
                <div class="d-none">
                    <audio controls :autoplay="audioPlayerStore.audioPlayerSetting.autoPlay" ref="audioPlayerRef"
                        id="audioPlayerRef" :src="audioPlayerStore.audioFiles?.audio_url"
                        :type="`audio/${audioPlayerStore.audioFiles?.format}`" @pause="audioPlayerStore.playbackPaused"
                        @playing="audioPlayerStore.playbackPlaying" @ended="playbackEnded"
                        @canplaythrough="canPlayThrough" @timeupdate="playbackListener" @loadeddata="loadedData"
                        @progress="onProgress" @loadedmetadata="loadMetaData" @seek="playbackSeek">
                    </audio>
                </div>
            </ion-toolbar>
            <audio-player-modal-component trigger="audio-modal" :is-playing="audioPlayerStore.isPlaying"
                :verse-timing="audioPlayerStore.verseTiming" :selected-reciter="audioPlayerStore.selectedReciter"
                :audio-files="audioPlayerStore.audioFiles" :chapter-name="audioPlayerStore.chapterName"
                :loop-audio="audioPlayerStore.loopAudio" :media-volume="audioPlayerStore.mediaVolume"
                :map-recitions="audioPlayerStore.mapRecitions" :progress-timer="audioPlayerStore.progressTimer"
                @update:change-volume="changeMediaVolume" @update:seek="playbackSeek"
                @update:download="audioPlayerStore.downloadAudioFile" @update:play-chapter="playChapterAudio"
                @update:play-next="playNext" @update:play-prev="audioPlayerStore.playPrevious()"
                @update:play-audio="playAudio" @update:loop-audio="audioPlayerStore.loopAudio = $event"
                @update:selected-reciter="handleSelectedReciter">
            </audio-player-modal-component>
        </ion-footer>
    </Transition>

</template>
<style scoped>
.d-none {
    display: none !important;
}

ion-avatar {
    --border-radius: 4px;

}

.footer {
    height: 57px;
    padding: 0px 10px;
}

/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
}
.reciter-chip {
    border-style: none;
}
</style>