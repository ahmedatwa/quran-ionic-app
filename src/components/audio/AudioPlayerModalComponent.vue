<script lang="ts" setup>
import { computed, ref } from "vue"
import { IonButtons, IonButton, IonHeader, IonToolbar, IonSkeletonText, IonList } from "@ionic/vue"
import { IonContent, modalController, IonRow, IonLabel, IonThumbnail, IonItem } from '@ionic/vue';
import { IonRange, IonCol, IonGrid, IonIcon, IonImg, IonText, IonListHeader } from '@ionic/vue';
import { IonItemOptions, IonItemOption, IonItemSliding, IonModal, alertController } from "@ionic/vue";
// ionicons
import { playOutline, playBackOutline, playForwardOutline, playCircleOutline } from 'ionicons/icons';
import { checkmarkDoneCircleOutline, cloudDownloadOutline, downloadOutline } from 'ionicons/icons';
import { pauseOutline, chevronDownOutline, ellipsisHorizontalOutline } from 'ionicons/icons';
import { volumeOffOutline, volumeHighOutline, repeatOutline } from 'ionicons/icons';
// stores
import { useChapterStore } from "@/stores/ChapterStore";
// utils
import { useLocale } from "@/utils/useLocale";
import { useBlob } from "@/utils/useBlob";
import { useStorage } from "@/utils/useStorage";
// axios
import { instance } from '@/axios';
// components
import ModalComponent from "@/components/common/ModalComponent.vue";
// types
import type { AudioFile, MapRecitions, Recitations, VerseTimingsProps } from "@/types/audio";

const modalRef = ref()
const { chapters, getVerseByVerseKey } = useChapterStore()
const { getLine, isRtl } = useLocale()
const isImgLoading = ref(true)
const pinFormatter = (value: number) => `${value}%`
const dismiss = () => modalController.dismiss(null, 'cancel');
const { setStorage, getStorage } = useStorage("__audio")
const { encodeBlobToBase64, decodeBase64toBlob } = useBlob()

const props = defineProps<{
    isPlaying: boolean
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
    "update:loop": [value: string]
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



const download = () => {
    if (props.audioFiles) {
        const audioUrl = props.audioFiles.audio_url
        const key = `${String(props.audioFiles?.reciterId)}-${props.audioFiles?.chapter_id}`
        instance.get(audioUrl, {
            responseType: 'blob',
        }).then(async (response) => {
            const base64Data = await encodeBlobToBase64(response.data) as string;
            setStorage(key, {
                reciterId: String(props.audioFiles?.reciterId),
                id: props.audioFiles?.id,
                chapter_id: props.audioFiles?.chapter_id,
                file_size: props.audioFiles?.file_size,
                format: props.audioFiles?.format,
                duration: props.audioFiles?.duration,
                verse_timings: JSON.stringify(props.audioFiles?.verse_timings),
                audio_url: base64Data,
            })
        }).finally(async () => {
            const alert = await alertController.create({
                header: props.chapterName + "." + props.audioFiles?.format,
                message: 'File has been downloaded!',
                buttons: ['Ok'],
            });

            await alert.present();
        });
    }
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
                        <ion-thumbnail style="height: 331px; width: 331px;" v-if="isImgLoading">
                            <ion-skeleton-text :animated="true"></ion-skeleton-text>
                        </ion-thumbnail>
                        <ion-img @ionImgDidLoad="isImgLoading = false"
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
                            @ion-input="$emit('update:seek', Number($event.detail.value))" :pin="true"
                            :pin-formatter="pinFormatter" :value="Math.round(progressTimer)" :min="0"
                            :max="audioFiles?.duration">
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
                            <ion-icon slot="icon-only" :icon="isPlaying ? pauseOutline : playOutline"
                                color="primary"></ion-icon>
                        </ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button fill="clear" @click="$emit('update:playNext', true)">
                            <ion-icon slot="icon-only" :icon="playForwardOutline"></ion-icon>
                        </ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button fill="clear" v-if="loopAudio === 'none'" @click="$emit('update:loop', 'repeat')">
                            <ion-icon slot="icon-only" :icon="repeatOutline" color="medium"></ion-icon>
                        </ion-button>
                        <ion-button fill="clear" v-else-if="loopAudio === 'repeat'"
                            @click="$emit('update:loop', 'none')">
                            <ion-icon slot="icon-only" :icon="repeatOutline" color="primary"></ion-icon>
                        </ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-button fill="clear" @click="download">
                            <ion-icon slot="icon-only" :icon="cloudDownloadOutline" color="danger"></ion-icon>
                        </ion-button>
                    </ion-col>
                </ion-row>
                <ion-row class="ion-justify-content-center">
                    <ion-col size="12">
                        <ion-range aria-label="Volume"
                            @ion-change="$emit('update:changeVolume', Number($event.detail.value))" :pin="true"
                            :pin-formatter="pinFormatter" :value="mediaVolume * 100">
                            <ion-icon slot="start" :icon="volumeOffOutline"></ion-icon>
                            <ion-icon slot="end" :icon="volumeHighOutline"></ion-icon>
                        </ion-range>
                    </ion-col>
                </ion-row>
                <ion-row class="ion-justify-content-center ion-margin-vertical">
                    <ion-col size="12">
                        <ion-list style="height: 400px; overflow-y: scroll;" class="ion-padding">
                            <ion-list-header>{{ getLine('audio.playlist') }}</ion-list-header>
                            <ion-item-sliding v-for="chapter in chapters" :key="chapter.id">
                                <ion-item :button="true">
                                    <ion-icon :icon="checkmarkDoneCircleOutline" color="primary" slot="start"
                                        v-if="audioFiles?.chapter_id === chapter.id"></ion-icon>
                                    <ion-label>
                                        <h3>
                                            <span v-if="isRtl">{{ chapter.nameArabic }}</span>
                                            <span v-else>{{ chapter.nameSimple }}</span>
                                        </h3>
                                        <p>{{ selectedReciter?.name }}</p>
                                    </ion-label>
                                </ion-item>
                                <ion-item-options slot="end">
                                    <ion-item-option color="warning" @click="download">
                                        <ion-icon slot="icon-only" :icon="downloadOutline"></ion-icon>
                                    </ion-item-option>
                                    <ion-item-option color="primary" @click="$emit('update:playChapter', chapter.id)">
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