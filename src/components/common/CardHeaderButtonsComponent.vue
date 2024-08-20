<script setup lang="ts">
import { IonSpinner, IonIcon, IonChip, IonButton, IonLabel } from '@ionic/vue';
import { pauseOutline, playOutline, languageOutline, informationCircleOutline } from 'ionicons/icons';
import { useLocale } from '@/utils/useLocale';
import type { PlayAudioEmit } from '@/types/audio';


const { getLine } = useLocale()

defineProps<{
    isPlaying: boolean
    chapterId: number
    verseKey?: string
    chapterInfo?: boolean
    isAudioLoading: boolean
}>()

defineEmits<{
    "update:playAudio": [value: PlayAudioEmit]
    "update:languageModalValue": [value: boolean]
    "update:surahInfo": [value: number]
}>()
</script>


<template>
    <div class="d-flex ion-justify-content-between">
        <ion-chip @click="$emit('update:playAudio', { audioID: chapterId, verseKey })" color="primary">
            <ion-spinner v-if="isAudioLoading" color="primary"></ion-spinner>
            <ion-icon v-else color="primary" :icon="isPlaying ? pauseOutline : playOutline"></ion-icon>
            <ion-label>{{ getLine('quranReader.buttonPlay') }}</ion-label>
        </ion-chip>
        <ion-button v-if="chapterInfo" fill="clear" @click="$emit('update:surahInfo', chapterId)">
            <ion-icon :icon="informationCircleOutline" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-button v-else @click="$emit('update:languageModalValue', true)" fill="clear">
            <ion-icon :icon="languageOutline" slot="icon-only"></ion-icon>
        </ion-button>
    </div>
</template>