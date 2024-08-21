<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { IonButtons, IonButton, IonHeader, IonToolbar, IonSkeletonText, IonList } from "@ionic/vue"
import { IonContent, modalController, IonRow, IonLabel, IonThumbnail, IonItem, IonSpinner } from '@ionic/vue';
import { IonRange, IonCol, IonGrid, IonIcon, IonImg, IonText, IonListHeader } from '@ionic/vue';
import { IonItemOptions, IonItemOption, IonItemSliding, IonModal } from "@ionic/vue";
// ionicons
import { playOutline, playBackOutline, playForwardOutline, playCircleOutline } from 'ionicons/icons';
import { musicalNoteOutline, downloadOutline } from 'ionicons/icons';
import { pauseOutline, chevronDownOutline, ellipsisHorizontalOutline } from 'ionicons/icons';
import { repeatOutline } from 'ionicons/icons';
// stores
import { useChapterStore } from "@/stores/ChapterStore";
// utils
import { useLocale } from "@/utils/useLocale";
import { useStorage } from "@/utils/useStorage";
// components
import ModalComponent from "@/components/common/ModalComponent.vue";
// types
import type { AudioFile, MapRecitions, Recitations, VerseTimingsProps } from "@/types/audio";

const modalRef = ref()
const { chapters, getVerseByVerseKey } = useChapterStore()
const { getLine, isRtl } = useLocale()
const isImgLoading = ref(true)
const downloadedKeys = ref<string[]>([])
const { storageKeys } = useStorage("__audioDB")
const dismiss = () => modalController.dismiss(null, 'cancel');

const props = defineProps<{
    isPlaying: boolean
    isLoading: boolean
    verseTiming?: VerseTimingsProps
    selectedReciter?: Recitations
    audioFiles: AudioFile | null
    chapterName?: string
    progressTimer: number
    mediaVolume: number
    loopAudio: string
    mapRecitions?: MapRecitions
}>()

const emit = defineEmits<{
    "update:playAudio": [value: boolean]
    "update:playChapter": [value: number]
    "update:changeVolume": [value: number]
    "update:seek": [value: number]
    "update:download": [value: boolean]
    "update:selectedReciter": [value: Recitations]
    "update:playNext": [value: boolean]
    "update:playPrev": [value: boolean]
    "update:loopAudio": [value: string]
}>()

const getCurrentVerseData = computed(() => {
    const timing = props.verseTiming
    if (timing) {
        const verseKey = String(timing.verseKey)
        const verse = getVerseByVerseKey(verseKey)
        if (verse) {
            return {
                juzNumber: verse.juz_number,
                hizbNumber: verse.hizb_number,
                pageNumber: verse.page_number
            }

        }
    }
})

onMounted(async () => {
    const result = await storageKeys()
    if (result) downloadedKeys.value = result
})

const isDownloadDisabled = (reciterID: string | number, audioID: string | number) => {
    const key = String(reciterID).concat("-").concat(String(audioID))
    if (downloadedKeys.value) {
        return downloadedKeys.value.includes(key)
    }
}

const download = (reciterId: string, chapterId: string) => {
    const key = reciterId.concat("-").concat(chapterId)
    downloadedKeys.value?.push(key)
    emit('update:download', true)
}
</script>

<template>
    <ion-modal ref="modalRef" trigger="audio-modal">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button color="medium" @click="dismiss">
                        <ion-icon :icon="chevronDownOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding ion-margin-vertical">
            <ion-grid>
                <ion-row class="ion-justify-content-center">
                    <ion-col size="11">
                        <ion-thumbnail style="height: 300px; width: 300px;" v-if="isImgLoading">
                            <ion-skeleton-text :animated="true"></ion-skeleton-text>
                        </ion-thumbnail>
                        <ion-img @ion-img-did-load="isImgLoading = false"
                            :src="`/reciters/${selectedReciter?.reciter_id}.jpg`"
                            :alt="selectedReciter?.name"></ion-img>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col size="12">
                        <ion-text class="ion-padding-vertical">
                            <ion-text>
                                <h3>{{ chapterName }}</h3>
                            </ion-text>
                            <ion-text>
                                <h4>{{ selectedReciter?.name }}</h4>
                            </ion-text>
                            <ion-text v-if="getCurrentVerseData">
                                <p>Hizb {{ getCurrentVerseData?.hizbNumber }} | Page {{ getCurrentVerseData?.pageNumber
                                    }} |
                                    Juz {{ getCurrentVerseData?.juzNumber }}</p>
                            </ion-text>
                        </ion-text>
                    </ion-col>
                </ion-row>
                <ion-row class="ion-justify-content-center">
                    <ion-col size="12">
                        <ion-range aria-label="Seek" color="primary"
                            @ion-input="$emit('update:seek', Number($event.detail.value))"
                            :value="Math.round(progressTimer)" :min="0" :max="audioFiles?.duration">
                        </ion-range>
                    </ion-col>
                </ion-row>
                <ion-row class="ion-justify-content-evenly">
                    <ion-col>
                        <ion-button fill="clear" id="reciters-modal">
                            <ion-icon slot="icon-only" :icon="ellipsisHorizontalOutline"></ion-icon>
                        </ion-button>
                        <modal-component :title="getLine('settings.reciters')" trigger="reciters-modal"
                            :data="mapRecitions" :selected="selectedReciter"
                            @update:selected-recition="$emit('update:selectedReciter', $event)">
                        </modal-component>
                    </ion-col>
                    <ion-col>
                        <ion-button fill="clear" @click="$emit('update:playPrev', true)">
                            <ion-icon slot="icon-only" :icon="playBackOutline"></ion-icon>
                        </ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button fill="clear" @click="$emit('update:playAudio', true)">
                            <ion-spinner v-if="isLoading"></ion-spinner>
                            <ion-icon v-else slot="icon-only" :icon="isPlaying ? pauseOutline : playOutline"
                                color="primary"></ion-icon>
                        </ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button fill="clear" @click="$emit('update:playNext', true)">
                            <ion-icon slot="icon-only" :icon="playForwardOutline"></ion-icon>
                        </ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button fill="clear" v-if="loopAudio === 'none'"
                            @click="$emit('update:loopAudio', 'repeat')">
                            <ion-icon slot="icon-only" :icon="repeatOutline" color="medium"></ion-icon>
                        </ion-button>
                        <ion-button fill="clear" v-else-if="loopAudio === 'repeat'"
                            @click="$emit('update:loopAudio', 'none')">
                            <ion-icon slot="icon-only" :icon="repeatOutline" color="primary"></ion-icon>
                        </ion-button>
                    </ion-col>
                </ion-row>
                <ion-row class="ion-justify-content-center ion-margin-vertical">
                    <ion-col size="12">
                        <ion-list-header class="ion-margin-bottom">
                            <ion-icon :icon="musicalNoteOutline" style="margin-right: 5px;"></ion-icon> {{
                                getLine('audio.playlist') }}
                        </ion-list-header>
                        <ion-list style="height: 400px; overflow-y: scroll;" class="ion-padding" :inset="true">
                            <ion-item-sliding v-for="chapter in chapters" :key="chapter.id">
                                <ion-item :button="true">
                                    <ion-label>
                                        <h3>
                                            <span v-if="isRtl">{{ chapter.nameArabic }}</span>
                                            <span v-else>{{ chapter.nameSimple }}</span>
                                        </h3>
                                        <p>{{ selectedReciter?.name }}</p>
                                    </ion-label>
                                </ion-item>
                                <ion-item-options slot="end">
                                    <ion-item-option
                                        :color="isDownloadDisabled(String(audioFiles?.reciterId), String(chapter.id)) ? 'medium' : 'success'"
                                        @click="download(String(audioFiles?.reciterId), String(chapter.id))"
                                        :disabled="isDownloadDisabled(String(audioFiles?.reciterId), String(chapter.id))">
                                        <ion-icon slot="icon-only" :icon="downloadOutline"></ion-icon>
                                    </ion-item-option>
                                    <ion-item-option color="primary" @click="$emit('update:playChapter', chapter.id)"
                                        :disabled="audioFiles?.chapter_id === chapter.id && isPlaying">
                                        <ion-icon slot="icon-only" :icon="playCircleOutline"></ion-icon>
                                    </ion-item-option>
                                </ion-item-options>
                            </ion-item-sliding>
                        </ion-list>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-modal>
</template>