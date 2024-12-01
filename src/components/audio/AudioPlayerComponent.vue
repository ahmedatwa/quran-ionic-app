<script lang="ts" setup>
import { computed } from "vue"
import { IonToolbar, IonFooter, IonButtons, IonAvatar } from '@ionic/vue';
import { IonIcon, IonButton, IonSpinner, IonChip, IonText } from '@ionic/vue';
import { playOutline, playForwardOutline, pauseOutline } from 'ionicons/icons';
// components
import AudioPlayerModalComponent from '@/components/audio/AudioPlayerModalComponent.vue';
// stores
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useAudioStore } from '@/stores/AudioStore';
import { useChapterStore } from "@/stores/ChapterStore";
import { useJuzStore } from "@/stores/JuzStore";

// utils
import { truncate } from "@/utils/string";
// types
import type { Recitations } from "@/types/audio"
import type { Chapter } from "@/types/chapter";

const recitationsStore = useRecitionsStore()
const audioStore = useAudioStore()
const chapterStore = useChapterStore()
const juzStore = useJuzStore()

defineProps<{
    modelValue: boolean
}>()

defineEmits<{
    "update:modelValue": [value: boolean]
}>()

const getCurrentVerseData = computed(() => {
    if (audioStore.verseTiming) {
        const verseKey = audioStore.verseTiming.verseKey
        const verse = chapterStore.getVerseByVerseKey(verseKey)
        if (verse) {
            return {
                juzNumber: verse.juz_number,
                hizbNumber: verse.hizb_number,
                pageNumber: verse.page_number,
                surah: audioStore.verseTiming.chapterId,
                ayah: audioStore.verseTiming.verseNumber,
            }

        } else {
            return {
                surah: audioStore.verseTiming.chapterId,
                ayah: audioStore.verseTiming.verseNumber,
                juzNumber: null,
                hizbNumber: null,
                pageNumber: null,
            }
        }
    }
})

const getRecentlyPlayed = computed(() => {
    const cs: Chapter[] = []
    if (audioStore.recentlyPlayed) {
        audioStore.recentlyPlayed.forEach((chapterId) => {
            const chapter = chapterStore.chapters?.find((c) => c.id === chapterId)
            if (chapter) cs.push({ ...chapter })
        })
    }
    return cs
})

</script>

<template>
    <Transition name="slide-fade">
        <ion-footer v-if="modelValue" class="footer ion-no-border">
            <ion-toolbar>
                <div id="audio-modal">
                    <ion-chip :outline="true" class="reciter-chip">
                        <ion-avatar>
                            <img :alt="recitationsStore.selectedReciter?.name" class="img"
                                :src="`/reciters/${recitationsStore.selectedReciter?.reciter_id}.jpg`" />
                        </ion-avatar>
                        <ion-text>{{ truncate(String(recitationsStore.selectedReciter?.name), 25) }}
                            <p style="margin: 1px;">{{ audioStore.chapterName }} </p>
                        </ion-text>
                    </ion-chip>
                </div>
                <ion-buttons slot="end">
                    <ion-button fill="clear" @click="audioStore.handlePlay" size="small">
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
                :active-audio-id="audioStore.chapterId" :is-loading="audioStore.isLoading" :verse-data="getCurrentVerseData"
                :juzs="juzStore.juzs" :selected-reciter="recitationsStore.selectedReciter"
                :audio-files="audioStore.audioFiles" :chapter-name="audioStore.chapterName"
                :loop-audio="audioStore.loopAudio" :media-volume="audioStore.mediaVolume"
                :map-recitions="recitationsStore.mapRecitions" :progress-timer="audioStore.progressTimer"
                @update:change-volume="audioStore.changeMediaVolume" @update:seek="audioStore.playbackSeek"
                @update:download="audioStore.attemptFileSave($event)" @update:play-chapter="audioStore.playChapterAudio"
                @update:play-next="audioStore.playNext" @update:play-prev="audioStore.playPrevious()"
                @update:play-audio="audioStore.handlePlay" @update:loop-audio="audioStore.loopAudio = $event"
                :recently-played="getRecentlyPlayed" @update:selected-reciter="recitationsStore.handleSelectedReciter">
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