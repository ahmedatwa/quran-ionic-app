<script setup lang="ts">
import { computed } from 'vue';
import { IonFab, IonFabButton, IonFabList, IonIcon, IonAvatar } from '@ionic/vue';
import { ellipsisHorizontalCircleOutline, pauseCircleOutline, playCircleOutline } from 'ionicons/icons';
import { playForwardOutline, playBackOutline } from 'ionicons/icons';
// components
import AudioPlayerModalComponent from '@/components/audio/AudioPlayerModalComponent.vue';

import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";


const audioPlayerStore = useAudioPlayerStore()

const playChapterAudio = (audioID: number) => {
    audioPlayerStore.getAudio({ audioID })
}

const isvisible = computed(() => audioPlayerStore.audioPlayerSetting.fab && audioPlayerStore.audioFiles)

</script>
<template>
    <ion-fab horizontal="end" vertical="center" v-if="isvisible">
        <ion-fab-button size="small" color="secondary">
            <ion-avatar>
                <img :alt="audioPlayerStore.selectedReciter?.name" class="img"
                    :src="`/reciters/${audioPlayerStore.selectedReciter?.reciter_id}.jpg`" />
            </ion-avatar>
        </ion-fab-button>
        <ion-fab-list side="top">
            <ion-fab-button @click="audioPlayerStore.handlePlay()" color="primary">
                <ion-icon :icon="audioPlayerStore.isPlaying ? pauseCircleOutline : playCircleOutline"></ion-icon>
            </ion-fab-button>
            <ion-fab-button id="audio-modal-fab" color="warning">
                <ion-icon :icon="ellipsisHorizontalCircleOutline"></ion-icon>
            </ion-fab-button>
        </ion-fab-list>
        <ion-fab-list side="start">
            <ion-fab-button @click="audioPlayerStore.playNext()">
                <ion-icon :icon="playForwardOutline"></ion-icon>
            </ion-fab-button>
            <ion-fab-button @click="audioPlayerStore.playPrevious()">
                <ion-icon :icon="playBackOutline"></ion-icon>
            </ion-fab-button>
        </ion-fab-list>
    </ion-fab>
    <audio-player-modal-component trigger="audio-modal-fab" :is-playing="audioPlayerStore.isPlaying"
        :is-loading="audioPlayerStore.isLoading" :verse-timing="audioPlayerStore.verseTiming"
        :selected-reciter="audioPlayerStore.selectedReciter" :audio-files="audioPlayerStore.audioFiles"
        :chapter-name="audioPlayerStore.chapterName" :loop-audio="audioPlayerStore.loopAudio"
        :media-volume="audioPlayerStore.mediaVolume" :map-recitions="audioPlayerStore.mapRecitions"
        :progress-timer="audioPlayerStore.progressTimer" @update:change-volume="audioPlayerStore.changeMediaVolume"
        @update:seek="audioPlayerStore.playbackSeek" @update:download="audioPlayerStore.downloadAudioFile"
        @update:play-chapter="playChapterAudio" @update:play-next="audioPlayerStore.playNext"
        @update:play-prev="audioPlayerStore.playPrevious()" @update:play-audio="audioPlayerStore.handlePlay"
        @update:loop-audio="audioPlayerStore.loopAudio = $event"
        @update:selected-reciter="audioPlayerStore.handleSelectedReciter">
    </audio-player-modal-component>

</template>