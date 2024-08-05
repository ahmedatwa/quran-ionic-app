<script lang="ts" setup>
import { ref, watchEffect, computed, onUnmounted, onMounted } from "vue"
import { IonToolbar, IonFooter, IonRow, IonAvatar, IonSpinner } from '@ionic/vue';
import { IonCol, IonGrid, IonIcon, modalController, IonButton, createAnimation } from '@ionic/vue';
import { playOutline, playForwardOutline, pauseOutline, closeOutline } from 'ionicons/icons';
import { useAudioPlayerStore } from '@/stores/AudioPlayerStore';
// types
import AudioPlayerModalComponent from './AudioPlayerModalComponent.vue';
import { secondsFormatter, milliSecondsToSeconds, secondsToMilliSeconds } from "@/utils/datetime"
import { getLangFullLocale } from "@/utils/locale"
import { useLocale } from "@/utils/useLocale"
// types
import type { VerseTimings, VerseTimingSegments } from "@/types/audio"
import { makeWordLocation, getVerseNumberFromKey, getChapterIdfromKey } from "@/utils/verse"
import { useMetaStore } from "@/stores/MetaStore";
import type { Animation } from '@ionic/vue';

const audioPlayerStore = useAudioPlayerStore()
const metaStore = useMetaStore();
const audioPlayerRef = ref<HTMLAudioElement>()
const { getLocale } = useLocale()
let animation: Animation;
const footerRef = ref(null);

onMounted(async () => {
    animation = createAnimation()
        .addElement(footerRef.value?.$el)
        .duration(2000)
        .beforeStyles({
            filter: 'translateX(100px)',
        })
        .beforeClearStyles(['box-shadow'])
        .afterClearStyles(['filter'])
        .keyframes([
            { offset: 0, transform: 'scale(1)' },
            { offset: 0.5, transform: 'scale(1.5)' },
            { offset: 1, transform: 'scale(1)' },
        ]);

    await animation.play()
});

const emit = defineEmits<{
    "update:modelValue": [value: boolean]
}>()

const openModal = async () => {
    const modal = await modalController.create({
        component: AudioPlayerModalComponent,
    });

    modal.present();
};

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
            break;
    }
    //
};

//Remove listeners after audio play stops
const cleanupListeners = () => {
    if (audioPlayerRef.value) {
        audioPlayerStore.listenerActive = false;
        audioPlayerStore.isPlaying = false;
        audioPlayerRef.value.removeEventListener("timeupdate", playbackListener);
        audioPlayerRef.value.removeEventListener("ended", playbackEnded);
        audioPlayerRef.value.removeEventListener("pause", audioPlayerStore.playbackPaused);
        // dismiss on playbavc ends
        if (audioPlayerStore.audioPlayerSetting.dismissOnEnd) {
            closePlayer()
        }
    }
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

const playbackSeek = () => {
    if (audioPlayerRef.value) {
        audioPlayerRef.value.currentTime = milliSecondsToSeconds(audioPlayerStore.progressTimer);
        audioPlayerStore.progressTimer = secondsToMilliSeconds(audioPlayerRef.value.currentTime)
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
            // emit("update:modelValue", isPlaying.value);
        });
        navigator.mediaSession.setActionHandler("pause", () => {
            playAudio();
        });

        navigator.mediaSession.setActionHandler("seekto", ({ seekTime }) => {
            if (seekTime) {
                audioPlayerStore.progressTimer = secondsToMilliSeconds(seekTime);
                playbackSeek();
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
};

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
    if (audioPlayerRef.value) {
        audioPlayerRef.value.pause();
    }
    audioPlayerStore.chapterId = 0
    audioPlayerStore.selectedVerseKey = ""
    cleanupListeners()
    emit('update:modelValue', false)
}
</script>

<template>
    <ion-footer ref=footerRef>
        <ion-toolbar>
            <ion-grid>
                <ion-row>
                    <ion-col @click="openModal" size="6">
                        <ion-avatar>
                            <img :alt="audioPlayerStore.selectedReciter.name"
                                :src="`/reciters/${audioPlayerStore.selectedReciter.reciter_id}.jpg`" />
                        </ion-avatar>
                        <small style="color: #5f5f5f;">{{ audioPlayerStore.chapterName }}</small>
                    </ion-col>
                    <ion-col size="6" class="ion-text-right">
                        <ion-button fill="clear" @click="playAudio">
                            <ion-spinner v-if="audioPlayerStore.isLoading"></ion-spinner>
                            <ion-icon :icon="audioPlayerStore.isPlaying ? pauseOutline : playOutline" v-else></ion-icon>
                        </ion-button>
                        <ion-button fill="clear" @click="audioPlayerStore.playNext">
                            <ion-icon :icon="playForwardOutline"></ion-icon>
                        </ion-button>
                        <ion-button fill="clear" @click="closePlayer">
                            <ion-icon :icon="closeOutline" color="danger"></ion-icon>
                        </ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-toolbar>
        <div v-if="audioPlayerStore.audioFiles">
            <audio controls :autoplay="audioPlayerStore.audioPlayerSetting.autoPlay" ref="audioPlayerRef"
                id="audioPlayerRef" class="d-none" :src="audioPlayerStore.audioFiles.audio_url"
                :type="`audio/${audioPlayerStore.audioFiles.format}`" @pause="audioPlayerStore.playbackPaused"
                @playing="audioPlayerStore.playbackPlaying" @ended="playbackEnded" @canplaythrough="canPlayThrough"
                @timeupdate="playbackListener" @loadeddata="loadedData" @progress="onProgress"
                @loadedmetadata="loadMetaData" @seek="playbackSeek">
            </audio>
        </div>
    </ion-footer>
</template>
<style scoped>
.d-none {
    display: none;
}

ion-avatar {
    --border-radius: 4px;

}
</style>
