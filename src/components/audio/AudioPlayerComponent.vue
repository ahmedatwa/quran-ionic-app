<script lang="ts" setup>
import { IonToolbar, IonFooter, IonButtons, IonAvatar } from '@ionic/vue';
import { IonIcon, IonButton, IonSpinner, IonChip, IonText } from '@ionic/vue';
import { playOutline, playForwardOutline, pauseOutline } from 'ionicons/icons';
// components
import AudioPlayerModalComponent from '@/components/audio/AudioPlayerModalComponent.vue';
// types
import type { Recitations } from "@/types/audio"
// stores
//import { useAudioPlayerStore } from '@/stores/AudioPlayerStore';
import { useHowlerPlayerStore } from '@/stores/HowlerPlayerStore';
// utils
import { truncate } from "@/utils/string";



//const audioPlayerStore = useAudioPlayerStore()
const howlerStore = useHowlerPlayerStore()

defineProps<{
    modelValue: boolean
}>()

defineEmits<{
    "update:modelValue": [value: boolean]
}>()


</script>

<template>
    <Transition name="slide-fade">
        <ion-footer v-if="modelValue" class="footer ion-no-border">
            <ion-toolbar>
                <div id="audio-modal">
                    <ion-chip :outline="true" class="reciter-chip">
                        <ion-avatar>
                            <img :alt="howlerStore.selectedReciter?.name" class="img"
                                :src="`/reciters/${howlerStore.selectedReciter?.reciter_id}.jpg`" />
                        </ion-avatar>
                        <ion-text>{{ truncate(String(howlerStore.selectedReciter?.name), 25) }}
                            <p style="margin: 1px;">{{ howlerStore.chapterName }} </p>
                        </ion-text>
                    </ion-chip>
                </div>
                <ion-buttons slot="end">
                    <ion-button fill="clear" @click="howlerStore.handlePlay" size="small">
                        <ion-spinner v-if="howlerStore.isLoading"></ion-spinner>
                        <ion-icon slot="icon-only" :icon="howlerStore.isPlaying ? pauseOutline : playOutline"
                            v-else></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" @click="howlerStore.playNext" size="small">
                        <ion-icon slot="icon-only" :icon="playForwardOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <audio-player-modal-component trigger="audio-modal" :is-playing="howlerStore.isPlaying"
                :is-loading="howlerStore.isLoading" :verse-timing="undefined"
                :selected-reciter="howlerStore.selectedReciter" :audio-files="howlerStore.audioFiles"
                :chapter-name="howlerStore.chapterName" :loop-audio="howlerStore.loopState"
                :media-volume="howlerStore.mediaVolume" :map-recitions="howlerStore.mapRecitions" :progress-timer="0"
                @update:change-volume="howlerStore.changeVolume" @update:seek="howlerStore.seek"
                @update:download="howlerStore.downloadAudioFile" @update:play-chapter="howlerStore.playChapterAudio"
                @update:play-next="howlerStore.playNext" @update:play-prev="howlerStore.playPrevious()"
                @update:play-audio="howlerStore.handlePlay" @update:loop-audio="howlerStore.loopState = $event"
                @update:selected-reciter="howlerStore.handleSelectedReciter">
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