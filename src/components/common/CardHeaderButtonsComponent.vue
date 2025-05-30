<script setup lang="ts">
import { computed, toValue } from 'vue';
import { IonIcon, IonChip, IonButton, IonLabel, IonAlert } from '@ionic/vue';
import { pauseOutline, playOutline, languageOutline } from 'ionicons/icons';
import { informationCircleOutline, downloadOutline } from 'ionicons/icons';
// stores
import { useTranslationsStore } from '@/stores/TranslationsStore';
// utils
import { upperCaseFirst } from '@/utils/string';
// composables
import { useLocale } from '@/composables/useLocale';
import { useSettings } from '@/composables/useSettings';
// types
import type { Translation } from '@/types/translations';
import type { PlayAudioEmit } from '@/types/audio';


const { getLine } = useLocale()
const translationStore = useTranslationsStore()
const settings = useSettings()
const alertButtons = [getLine("buttons.cancel"), getLine("buttons.ok")];

const props = defineProps<{
    isPlaying: boolean
    chapterId: number
    verseKey?: string
    chapterInfo?: boolean
    isAudioLoading: boolean
    downloadProgress?: string | number
}>()

defineEmits<{
    "update:playAudio": [value: PlayAudioEmit]
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

const translationAlertHeader = computed(() => {
    if (translationStore.selectedTranslation) {
        return upperCaseFirst(translationStore.selectedTranslation.language_name) + ": " + translationStore.selectedTranslation?.author_name
    }
})

const translations = computed(() => {
    return translationStore.translationsList.map((tr) => {
        return {
            label: upperCaseFirst(tr.language_name) + ' - ' + tr.author_name,
            type: 'radio',
            value: tr
        }
    }).sort((a, b) => a.label.localeCompare(b.label))
})

const getSelectedTranslation = (ev: CustomEvent) => {
    if (ev.detail.data) {
        const transaltion: Translation = ev.detail.data.values
        translationStore.selectedTranslation = toValue(transaltion)
        settings.updateSelectedTranslations(toValue(transaltion))
    }
}

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
                <ion-label>{{ isPlaying ? getLine('quranReader.buttonPause') : getLine('quranReader.buttonPlay')
                }}</ion-label>
            </span>
        </ion-chip>
        <ion-button v-if="chapterInfo" fill="clear" @click="$emit('update:surahInfo', chapterId)">
            <ion-icon :icon="informationCircleOutline" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-button v-else id="present-alert" fill="clear">
            <ion-icon :icon="languageOutline" slot="icon-only"></ion-icon>
        </ion-button>
        <!-- Alert Transaltion -->
        <ion-alert v-if="!chapterInfo" trigger="present-alert" :header="translationAlertHeader" :buttons="alertButtons"
            :inputs="translations" @did-dismiss="getSelectedTranslation($event)"></ion-alert>
    </div>
</template>
<style>
.d-inherit {
    display: inherit;
}
</style>