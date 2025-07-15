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
import { storeToRefs } from 'pinia';


const { getLine } = useLocale()
const { selectedTranslation, translationsList, selectedTranslationId } = storeToRefs(useTranslationsStore())
const { updateSelectedTranslations } = useSettings()

const alertButtons = [{
    text: getLine("buttons.cancel"),
    role: 'cancel',
}, {
    text: getLine("buttons.ok"),
    role: 'confirm',
}]

const props = defineProps<{
    isPlaying: boolean
    chapterId: number
    verseKey?: string
    chapterInfo?: boolean
    isAudioLoading: boolean
    downloadProgress?: string | number
}>()

const emit = defineEmits<{
    "update:playAudio": [value: PlayAudioEmit]
    "update:surahInfo": [value: number]
    "update:selectedTranslation": [value: Translation]
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
    if (selectedTranslation.value) {
        return upperCaseFirst(selectedTranslation.value.language_name) + ": " + selectedTranslation.value?.author_name
    }
})

const translations = computed(() => {
    return translationsList.value.map((tr) => {
        return {
            label: upperCaseFirst(tr.language_name) + ' - ' + tr.author_name,
            type: 'radio',
            value: tr,
            checked: selectedTranslationId.value === tr.id
        }
    }).sort((a, b) => a.label.localeCompare(b.label))
})

const getSelectedTranslation = (ev: CustomEvent) => {    
    if (ev.detail.role === "confirm" && ev.detail.data.values) {
        const transaltion: Translation = ev.detail.data.values
        emit("update:selectedTranslation", toValue(transaltion))
        updateSelectedTranslations(toValue(transaltion))
    } else {
        return
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