<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { IonButtons, IonButton, IonHeader, IonToolbar, IonSkeletonText } from "@ionic/vue"
import { IonContent, modalController, IonRow, IonThumbnail, IonSpinner } from '@ionic/vue';
import { IonRange, IonCol, IonGrid, IonIcon, IonImg, IonText, isPlatform } from '@ionic/vue';
import { IonModal } from "@ionic/vue";
// ionicons
import { playOutline, playBackOutline, playForwardOutline, repeatOutline } from 'ionicons/icons';
import { volumeLowOutline, volumeHighOutline } from 'ionicons/icons';
import { pauseOutline, chevronDownOutline, ellipsisHorizontalOutline } from 'ionicons/icons';
// utils
import { useLocale } from "@/utils/useLocale";
import { useStorage } from "@/utils/useStorage";
// components
import ModalComponent from "@/components/common/ModalComponent.vue";
import AudioModalAllChapters from "@/components/audio/parts/AudioModalAllChapters.vue";
import AudioModalRecentPlay from "@/components/audio/parts/AudioModalRecentPlay.vue";
// types
import type { AudioFile, MapRecitions, Recitations } from "@/types/audio";
import type { Chapter } from "@/types/chapter";
import type { Juz } from "@/types/juz";

const modalRef = ref()
const { getLine } = useLocale()
const isImgLoading = ref(true)
const downloadedKeys = ref<string[]>([])
const { storageKeys } = useStorage("__audioDB")
const dismiss = () => modalController.dismiss(null, 'cancel');

const props = defineProps<{
    trigger: string
    isPlaying: boolean
    activeAudioId?: number
    isLoading: boolean
    verseData?: {
        juzNumber: number | null;
        hizbNumber: number | null;
        pageNumber: number | null;
        surah: number;
        ayah: number
    }
    chapters?: Chapter[]
    selectedReciter?: Recitations
    audioFiles: AudioFile | null
    chapterName?: string
    progressTimer: number
    mediaVolume: number
    loopAudio: string
    mapRecitions?: MapRecitions
    recentlyPlayed?: Chapter[],
    juzs?: Juz[]
}>()

const emit = defineEmits<{
    "update:playAudio": [value: boolean]
    "update:playChapter": [value: number]
    "update:changeVolume": [value: number]
    "update:seek": [value: number]
    "update:download": [value: string | number]
    "update:selectedReciter": [value: Recitations]
    "update:playNext": [value: boolean]
    "update:playPrev": [value: boolean]
    "update:loopAudio": [value: string]
}>()

onMounted(async () => {
    const result = await storageKeys()
    if (result) downloadedKeys.value = result
})

const changeMediaVolume = (ev: CustomEvent) => {
    const vol = ev.detail.value
    emit('update:changeVolume', vol)
}

const isAudioPlaying = (chapterId: number) => {
    return props.isPlaying && (chapterId === props.activeAudioId)
}

const isVolumeVisible = () => {
    if (isPlatform('mobileweb')) {
        return false;
    }
    return true;
}

    // test
   console.log(isPlatform('mobileweb'))
</script>

<template>
    <ion-modal ref="modalRef" :trigger="trigger">
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
                            <ion-text v-if="verseData">
                                <ion-text>
                                    {{ verseData?.hizbNumber ? getLine('audio.hizb', [verseData?.hizbNumber]) : '' }}
                                    {{ verseData?.pageNumber ? getLine('audio.page', [verseData?.pageNumber]) : '' }}
                                    {{ verseData?.juzNumber ? getLine('audio.juz', [verseData?.juzNumber]) : '' }}
                                    <br />
                                    {{ verseData.surah ? getLine('audio.surah', [verseData.surah]) : '' }}
                                    {{ verseData.ayah ? getLine('audio.ayah', [verseData.ayah]) : '' }}
                                </ion-text>
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
                            <ion-icon v-else slot="icon-only"
                                :icon="isAudioPlaying(Number(audioFiles?.chapter_id)) ? pauseOutline : playOutline"
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
                    <ion-col size="12" v-if="isVolumeVisible()">
                        <ion-range label-placement="start" :pin="true" :value="mediaVolume"
                            @ion-input="changeMediaVolume">
                            <ion-icon slot="start" :icon="volumeLowOutline"></ion-icon>
                            <ion-icon slot="end" :icon="volumeHighOutline"></ion-icon>
                        </ion-range>
                    </ion-col>
                </ion-row>
                <!-- recentlyPlayed -->
                <audio-modal-recent-play :is-playing="isPlaying" :audio-id="activeAudioId"
                    :recently-played="recentlyPlayed" :chapter-id="audioFiles?.chapter_id"></audio-modal-recent-play>
                <!-- All -->
                <audio-modal-all-chapters :juzs="juzs" :chapter-id="audioFiles?.chapter_id"
                    @update:download="$emit('update:download', $event)"
                    @update:play-chapter="$emit('update:playChapter', $event)"></audio-modal-all-chapters>
            </ion-grid>
        </ion-content>
    </ion-modal>
</template>
