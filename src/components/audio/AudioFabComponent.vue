<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { IonFab, IonFabButton, IonFabList, IonIcon, IonAvatar } from '@ionic/vue';
import { ellipsisHorizontalCircleOutline, pauseCircleOutline, playCircleOutline } from 'ionicons/icons';
import { playForwardOutline, playBackOutline } from 'ionicons/icons';
// components
import AudioPlayerModalComponent from '@/components/audio/AudioPlayerModalComponent.vue';
// stores
import { useAudioStore } from "@/stores/AudioStore";
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useJuzStore } from "@/stores/JuzStore";
// composables
import { useVerseTiming } from '@/composables/useVerseTiming';
import { useAudioFile } from "@/composables/useAudioFile";

const audioStore = useAudioStore()
const recitionsStore = useRecitionsStore()
const { juzList } = storeToRefs(useJuzStore())
const { verseTiming } = useVerseTiming()
const { attemptFileSave } = useAudioFile()

const playChapterAudio = (audioID: number) => {
    audioStore.getAudio({ audioID })
}

const isVisible = computed(() => audioStore.audioPlayerSetting.fab && audioStore.audioFiles)

const isPlaying = computed(() => {
    return audioStore.isPlaying && audioStore.audioFiles?.id === audioStore.chapterId
})
</script>
<template>
    <div v-if="isVisible">
        <ion-fab horizontal="end" vertical="center">
            <ion-fab-button size="small" color="secondary">
                <ion-avatar>
                    <img :alt="recitionsStore.selectedReciter?.name" class="img"
                        :src="`/reciters/${recitionsStore.selectedReciter?.reciter_id}.jpg`" />
                </ion-avatar>
            </ion-fab-button>
            <ion-fab-list side="top">
                <ion-fab-button @click="audioStore.handlePlay(true)" color="primary">
                    <ion-icon :icon="audioStore.isPlaying ? pauseCircleOutline : playCircleOutline"></ion-icon>
                </ion-fab-button>
                <ion-fab-button id="audio-modal-fab" color="warning">
                    <ion-icon :icon="ellipsisHorizontalCircleOutline"></ion-icon>
                </ion-fab-button>
            </ion-fab-list>
            <ion-fab-list side="start">
                <ion-fab-button @click="audioStore.playNext()">
                    <ion-icon :icon="playForwardOutline"></ion-icon>
                </ion-fab-button>
                <ion-fab-button @click="audioStore.playPrevious()">
                    <ion-icon :icon="playBackOutline"></ion-icon>
                </ion-fab-button>
            </ion-fab-list>
        </ion-fab>
        <audio-player-modal-component trigger="audio-modal-fab" :is-playing="isPlaying"
            :is-loading="audioStore.isLoading" :verse-timing="verseTiming"
            :selected-reciter="recitionsStore.selectedReciter" :audio-files="audioStore.audioFiles"
            :chapter-name="audioStore.chapterName" :loop-audio="audioStore.loopAudio"
            :media-volume="audioStore.mediaVolume" :map-recitions="recitionsStore.mapRecitions"
            :progress-timer="audioStore.progressTimer" @update:change-volume="audioStore.changeMediaVolume"
            @update:seek="audioStore.playbackSeek" @update:download="attemptFileSave"
            @update:play-chapter="playChapterAudio" @update:play-next="audioStore.playNext"
            @update:play-prev="audioStore.playPrevious()" @update:play-audio="audioStore.handlePlay"
            @update:loop-audio="audioStore.loopAudio = $event" :recently-played="audioStore.getRecentlyPlayed"
            @update:selected-reciter="recitionsStore.handleSelectedReciter" :juzs="juzList">
        </audio-player-modal-component>
    </div>
</template>