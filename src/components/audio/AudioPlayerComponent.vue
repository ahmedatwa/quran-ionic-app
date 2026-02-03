<script lang="ts" setup>
import { computed } from "vue"
import { IonToolbar, IonFooter, IonButtons, IonAvatar, IonProgressBar } from '@ionic/vue';
import { IonIcon, IonButton, IonSpinner, IonChip, IonText } from '@ionic/vue';
import { playOutline, playForwardOutline, pauseOutline, close } from 'ionicons/icons';
// components
import AudioPlayerModalComponent from '@/components/audio/AudioPlayerModalComponent.vue';
// stores
import { useAudioStore } from '@/stores/AudioStore';
import { useVerseTimingStore } from "@/stores/VerseTimingStore";
// utils
import { truncate } from "@/utils/string";
import { useAlert } from "@/composables/useAlert";
import { useLocale } from "@/composables/useLocale";
// composables
import { useAudioFile } from "@/composables/useAudioFile";

// types
import type { MapRecitions, Recitations } from "@/types/audio"
import type { Juz } from "@/types/juz"

const audioStore = useAudioStore()
const verseTimingStore = useVerseTimingStore()
const { attemptFileSave } = useAudioFile()
const { presentAlert } = useAlert()
const { getLine } = useLocale()

defineProps<{
    modelValue: boolean
    selectedReciter?: Recitations
    mapRecitions?: MapRecitions
    juzList?: Juz[]
    trigger: string
}>()

defineEmits<{
    "update:modelValue": [value: boolean]
    "update:selectedReciter": [value: Recitations]
}>()

const progressTimerValue = computed(() => {
    if (audioStore.currentTimestamp) {
        return audioStore.currentTimestamp / audioStore.duration
    } else {
        return 0
    }
})

const closePlayer = async () => {
    if (audioStore.audioPlayerSetting?.confirmClosePlayer) {
        await presentAlert({
            header: getLine("text.confirm"),
            buttons: [{
                text: getLine("buttons.ok"),
                role: 'Ok',
                handler: () => {
                    audioStore.closePlayer()
                }
            }, {
                text: getLine("buttons.cancel"),
                role: 'cancel',
            }]
        })
    } else {
        audioStore.closePlayer()
    }

}
</script>
<template>
    <Transition name="slide-fade">
        <ion-footer v-if="modelValue" class="footer ion-no-border">
            <ion-progress-bar :value="progressTimerValue"></ion-progress-bar>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-chip :outline="true" class="reciter-chip" :id="trigger">
                        <ion-avatar>
                            <img :alt="selectedReciter?.name" class="img"
                                :src="`/reciters/${selectedReciter?.reciter_id}.jpg`" />
                        </ion-avatar>
                        <ion-text>{{ truncate(String(selectedReciter?.name), 25) }}
                            <p style="margin: 1px;">{{ audioStore.chapterName }} </p>
                        </ion-text>
                    </ion-chip>
                </ion-buttons>
                <ion-buttons slot="end">
                    <ion-button fill="clear" @click="audioStore.handlePlay(true)" size="small">
                        <ion-spinner v-if="audioStore.isLoading"></ion-spinner>
                        <ion-icon slot="icon-only" :icon="audioStore.isPlaying ? pauseOutline : playOutline"
                            v-else></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" @click="audioStore.playNext" size="small" :disabled="audioStore.isPlaying">
                        <ion-icon slot="icon-only" :icon="playForwardOutline"></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" @click="closePlayer" size="small">
                        <ion-icon slot="icon-only" :icon="close"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <audio-player-modal-component :trigger="trigger" :is-playing="audioStore.isPlaying"
                :active-audio-id="audioStore.chapterId" :is-loading="audioStore.isLoading"
                :verse-data="verseTimingStore.getCurrentVerseHeaderData" :juzs="juzList"
                :selected-reciter="selectedReciter" :audio-files="audioStore.audioFiles"
                :chapter-name="audioStore.chapterName" :audio-player-setting="audioStore.audioPlayerSetting"
                :media-volume="audioStore.mediaVolume" :map-recitions="mapRecitions"
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