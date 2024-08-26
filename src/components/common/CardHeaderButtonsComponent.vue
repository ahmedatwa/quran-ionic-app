<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon, IonChip, IonButton, IonLabel } from '@ionic/vue';
import { pauseOutline, playOutline, languageOutline, informationCircleOutline, downloadOutline } from 'ionicons/icons';
import { useLocale } from '@/utils/useLocale';
import type { PlayAudioEmit } from '@/types/audio';



const { getLine } = useLocale()

const props = defineProps<{
    isPlaying: boolean
    chapterId: number
    verseKey?: string
    chapterInfo?: boolean
    isAudioLoading: boolean
    downloadProgress: string | number
}>()

defineEmits<{
    "update:playAudio": [value: PlayAudioEmit]
    "update:languageModalValue": [value: boolean]
    "update:surahInfo": [value: number]
}>()

const downloadStatus = computed(() => {
    if (props.downloadProgress) {
        if (props.downloadProgress === 100) {
            return false
        }
        return true
    }
})

</script>


<template>
    <div class="d-flex ion-justify-content-between">
        <ion-chip @click="$emit('update:playAudio', { audioID: chapterId, verseKey })" color="primary">
            <span v-if="downloadStatus" class="d-inherit">
                <ion-icon color="primary" :icon="downloadOutline"></ion-icon>
                <ion-label>{{ downloadProgress }} % {{ getLine('quranReader.textDowloading') }}</ion-label>
            </span>
            <span v-else class="d-inherit">
                <ion-icon color="primary" :icon="isPlaying ? pauseOutline : playOutline"></ion-icon>
                <ion-label>{{ getLine('quranReader.buttonPlay') }}</ion-label>
            </span>
        </ion-chip>
        <ion-button v-if="chapterInfo" fill="clear" @click="$emit('update:surahInfo', chapterId)">
            <ion-icon :icon="informationCircleOutline" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-button v-else @click="$emit('update:languageModalValue', true)" fill="clear">
            <ion-icon :icon="languageOutline" slot="icon-only"></ion-icon>
        </ion-button>
    </div>
</template>
<style>
.d-inherit {
    display: inherit;
}
</style>