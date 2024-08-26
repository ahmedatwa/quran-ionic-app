<script lang="ts" setup>
import { ref, watch } from "vue"
import { IonToolbar, IonFooter, IonButtons, IonAvatar } from '@ionic/vue';
import { IonIcon, IonButton, IonSpinner, IonChip, IonText } from '@ionic/vue';
import { playOutline, playForwardOutline, pauseOutline } from 'ionicons/icons';

// components
import AudioPlayerModalComponent from '@/components/audio/AudioPlayerModalComponent.vue';
// types
import type { Recitations } from "@/types/audio"
// stores
import { useAudioPlayerStore } from '@/stores/AudioPlayerStore';
import { truncate } from "@/utils/string";

const audioPlayerStore = useAudioPlayerStore()
const audioPlayerRef = ref<HTMLAudioElement>()

defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits<{
    "update:modelValue": [value: boolean]
}>()

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


// const loadMetaData = () => {
//     if (audioPlayerStore.chapterName) {
//         metaStore.setPageTitle(audioPlayerStore.chapterName);
//         metaStore.setMetaData([
//             { property: "og:audio:title", content: audioPlayerStore.chapterName },
//             { name: "twitter:title", content: audioPlayerStore.chapterName },
//             { property: "og:title", content: audioPlayerStore.chapterName },
//         ]);
//     }

//     if (audioPlayerStore.audioFiles) {
//         metaStore.setMetaData([
//             {
//                 property: "music:song:track",
//                 content: String(audioPlayerStore.audioFiles.id),
//             },
//             {
//                 property: "og:url",
//                 content: audioPlayerStore.audioFiles.audio_url as string,
//             },
//             {
//                 property: "og:type",
//                 content: audioPlayerStore.audioFiles.format as string,
//             },
//             {
//                 property: "og:audio",
//                 content: audioPlayerStore.audioFiles.audio_url,
//             },
//             {
//                 property: "music:duration",
//                 content: audioPlayerStore.audioFiles.duration.toString(),
//             },
//             {
//                 property: "og:audio:type",
//                 content: audioPlayerStore.audioFiles.format as string,
//             },
//         ]);
//     }

//     if (audioPlayerStore.selectedReciter) {
//         metaStore.setMetaData([
//             {
//                 name: "twitter:image",
//                 content: `/reciters/${audioPlayerStore.selectedReciter.reciter_id
//                     }.jpg`,
//             },
//             {
//                 property: "music:musician",
//                 content: audioPlayerStore.selectedReciter.name,
//             },
//             {
//                 property: "og:audio:artist",
//                 content: audioPlayerStore.selectedReciter.name,
//             },
//             {
//                 property: "og:image",
//                 content: `/reciters/${audioPlayerStore.selectedReciter.reciter_id}.jpg`,
//             },
//         ]);

//         // Media Controls
//         setMediaSession({
//             title: String(audioPlayerStore.chapterName),
//             artist: audioPlayerStore.selectedReciter.name,
//             album: "Quran",
//             artwork: [
//                 {
//                     src: `/reciters/${audioPlayerStore.selectedReciter.reciter_id}.jpg`,
//                     sizes: "96x96",
//                     type: "image/jpg",
//                 },
//             ],
//         })
//     }

//     // controls for android 

// }



const playChapterAudio = (audioID: number) => {
    audioPlayerStore.getAudio({ audioID })
}

</script>

<template>
    <Transition name="slide-fade">
        <ion-footer v-if="modelValue" :translucent="true" class="footer ion-no-border">
            <ion-toolbar>
                <div id="audio-modal">
                    <ion-chip :outline="true" class="reciter-chip">
                        <ion-avatar>
                            <img :alt="audioPlayerStore.selectedReciter?.name" class="img"
                                :src="`/reciters/${audioPlayerStore.selectedReciter?.reciter_id}.jpg`" />
                        </ion-avatar>
                        <ion-text>{{ truncate(String(audioPlayerStore.selectedReciter?.name), 25) }}
                            <p style="margin: 1px;">{{ audioPlayerStore.chapterName }} </p>
                        </ion-text>
                    </ion-chip>
                </div>
                <ion-buttons slot="end">
                    <ion-button fill="clear" @click="audioPlayerStore.handlePlay" size="small">
                        <ion-spinner v-if="audioPlayerStore.isLoading"></ion-spinner>
                        <ion-icon slot="icon-only" :icon="audioPlayerStore.isPlaying ? pauseOutline : playOutline"
                            v-else></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" @click="audioPlayerStore.playNext" size="small">
                        <ion-icon slot="icon-only" :icon="playForwardOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <audio-player-modal-component trigger="audio-modal" :is-playing="audioPlayerStore.isPlaying"
                :is-loading="audioPlayerStore.isLoading" :verse-timing="audioPlayerStore.verseTiming"
                :selected-reciter="audioPlayerStore.selectedReciter" :audio-files="audioPlayerStore.audioFiles"
                :chapter-name="audioPlayerStore.chapterName" :loop-audio="audioPlayerStore.loopAudio"
                :media-volume="audioPlayerStore.mediaVolume" :map-recitions="audioPlayerStore.mapRecitions"
                :progress-timer="audioPlayerStore.progressTimer"
                @update:change-volume="audioPlayerStore.changeMediaVolume" @update:seek="audioPlayerStore.playbackSeek"
                @update:download="audioPlayerStore.downloadAudioFile" @update:play-chapter="playChapterAudio"
                @update:play-next="audioPlayerStore.playNext" @update:play-prev="audioPlayerStore.playPrevious()"
                @update:play-audio="audioPlayerStore.handlePlay"
                @update:loop-audio="audioPlayerStore.loopAudio = $event"
                @update:selected-reciter="audioPlayerStore.handleSelectedReciter">
            </audio-player-modal-component>
        </ion-footer>
    </Transition>

</template>
<style scoped>
ion-avatar {
    --border-radius: 4px;
}

.footer {
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