<script lang="ts" setup>
import { IonToolbar, IonFooter, IonButtons, IonAvatar } from '@ionic/vue';
import { IonIcon, IonButton, IonSpinner, IonChip, IonText } from '@ionic/vue';
import { playOutline, playForwardOutline, pauseOutline } from 'ionicons/icons';
// components
import AudioPlayerModalComponent from '@/components/audio/AudioPlayerModalComponent.vue';
// stores
import { useAudioStore } from '@/stores/AudioStore';

// utils
import { truncate } from "@/utils/string";
// composables
import { useVerseTiming } from '@/composables/useVerseTiming';
import { useAudioFile } from "@/composables/useAudioFile";

// types
import type { MapRecitions, Recitations } from "@/types/audio"
import type { Juz } from "@/types/juz"

const audioStore = useAudioStore()
const { getCurrentVerseData } = useVerseTiming()
const { attemptFileSave } = useAudioFile()

defineProps<{
    modelValue: boolean
    selectedReciter?: Recitations
    mapRecitions?: MapRecitions
    juzList?: Juz[]
}>()

defineEmits<{
    "update:modelValue": [value: boolean]
    "update:selectedReciter": [value: Recitations]
}>()

</script>
<template>
    <Transition name="slide-fade">
        <ion-footer v-if="modelValue" class="footer ion-no-border">
            <ion-toolbar>
                <div id="audio-modal">
                    <ion-chip :outline="true" class="reciter-chip">
                        <ion-avatar>
                            <img :alt="selectedReciter?.name" class="img"
                                :src="`/reciters/${selectedReciter?.reciter_id}.jpg`" />
                        </ion-avatar>
                        <ion-text>{{ truncate(String(selectedReciter?.name), 25) }}
                            <p style="margin: 1px;">{{ audioStore.chapterName }} </p>
                        </ion-text>
                    </ion-chip>
                </div>
                <ion-buttons slot="end">
                    <ion-button fill="clear" @click="audioStore.handlePlay(true)" size="small">
                        <ion-spinner v-if="audioStore.isLoading"></ion-spinner>
                        <ion-icon slot="icon-only" :icon="audioStore.isPlaying ? pauseOutline : playOutline"
                            v-else></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" @click="audioStore.playNext" size="small">
                        <ion-icon slot="icon-only" :icon="playForwardOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <audio-player-modal-component trigger="audio-modal" :is-playing="audioStore.isPlaying"
                :active-audio-id="audioStore.chapterId" :is-loading="audioStore.isLoading"
                :verse-data="getCurrentVerseData" :juzs="juzList" :selected-reciter="selectedReciter"
                :audio-files="audioStore.audioFiles" :chapter-name="audioStore.chapterName"
                :loop-audio="audioStore.loopAudio" :media-volume="audioStore.mediaVolume" :map-recitions="mapRecitions"
                :progress-timer="audioStore.progressTimer" @update:change-volume="audioStore.changeMediaVolume"
                @update:seek="audioStore.playbackSeek" @update:download="attemptFileSave"
                @update:play-chapter="audioStore.playChapterAudio" @update:play-next="audioStore.playNext"
                @update:play-prev="audioStore.playPrevious()" @update:play-audio="audioStore.handlePlay"
                @update:loop-audio="audioStore.setLoopAudio($event)" :recently-played="audioStore.getRecentlyPlayed"
                @update:selected-reciter="$emit('update:selectedReciter', $event)">
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

ion-range {
    --height: 14px;
}
</style>