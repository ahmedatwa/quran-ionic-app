<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { IonButtons, IonButton, IonHeader, IonToolbar, IonSkeletonText, IonModal } from "@ionic/vue"
import { IonContent, modalController, IonRow, IonThumbnail, IonSpinner, IonChip } from '@ionic/vue';
import { IonRange, IonCol, IonGrid, IonIcon, IonImg, IonText, isPlatform } from '@ionic/vue';

// ionicons
import { playOutline, playBackOutline, playForwardOutline, repeatOutline, returnDownBackOutline } from 'ionicons/icons';
import { volumeLowOutline, volumeHighOutline } from 'ionicons/icons';
import { pauseOutline, chevronDownOutline } from 'ionicons/icons';
// composables
import { useLocale } from "@/composables/useLocale";
import { useStorage } from "@/composables/useStorage";
// components
import AudioModalAllChapters from "@/components/audio/parts/AudioModalAllChapters.vue";
import AudioModalRecentPlay from "@/components/audio/parts/AudioModalRecentPlay.vue";

// types
import type { AudioFile, MapRecitions, Recitations, AudioPlayerSettings } from "@/types/audio";
import type { Chapter } from "@/types/chapter";
import type { Juz } from "@/types/juz";
import type { VerseHeaderDataReturn } from "@/types/verse";

const modalRef = ref()
const { getLine } = useLocale()
const isImgLoading = ref(true)
const downloadedKeys = ref<string[]>([])
const { storageKeys } = useStorage("__audioDB")
const dismissModal = () => modalController.dismiss(null, 'cancel');

const props = defineProps<{
    trigger: string
    isPlaying: boolean
    activeAudioId?: number
    isLoading: boolean
    verseData?: VerseHeaderDataReturn
    chapters?: Chapter[]
    selectedReciter?: Recitations
    audioFiles: AudioFile | null
    chapterName?: string
    progressTimer: number
    mediaVolume: number
    mapRecitions?: MapRecitions
    recentlyPlayed?: Chapter[],
    juzs?: Juz[]
    audioPlayerSetting?: AudioPlayerSettings
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

const isAudioPlaying = (chapterId: number) =>
    props.isPlaying && (chapterId === props.activeAudioId)


const isVolumeVisible = computed(() => {
    if (isPlatform('ios') || isPlatform('android')) {
        return false
    }
    return true
})


const loopButton = computed(() => {
    if (props.audioPlayerSetting) {
        if (props.audioPlayerSetting.loopAudio === "never") {
            return {
                emit: "repeat",
                color: "medium",
                icon: repeatOutline
            }
        } else if (props.audioPlayerSetting.loopAudio === "repeat") {
            return {
                emit: "never",
                color: "primary",
                icon: repeatOutline
            }
        }
    }
    return {
        emit: "repeat",
        color: "medium",
        icon: repeatOutline
    }
})
</script>

<template>
    <ion-modal ref="modalRef" :trigger="trigger">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button color="medium" @click.stop="dismissModal">
                        <ion-icon :icon="chevronDownOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding ion-margin-vertical">
            <ion-grid>
                <ion-row class="ion-justify-content-center">
                    <ion-col size="11">
                        <ion-thumbnail style="height: 250px; width: 250px;" v-if="isImgLoading">
                            <ion-skeleton-text :animated="true"></ion-skeleton-text>
                        </ion-thumbnail>
                        <ion-img @ion-img-did-load="isImgLoading = false"
                            :src="`/reciters/${selectedReciter?.reciter_id}.jpg`"
                            :alt="selectedReciter?.name"></ion-img>
                    </ion-col>
                </ion-row>
                <ion-row class="ion-padding-top">
                    <ion-col size="12">
                        <ion-text class="ion-padding-vertical">
                            <ion-text>
                                <h3>{{ chapterName }}</h3>
                            </ion-text>
                            <ion-text>
                                <h4>{{ selectedReciter?.name }}</h4>
                            </ion-text>
                            <ion-text v-if="verseData" class="ion-padding-top">
                                <ion-chip :outline="true">{{ verseData.hizbNumber ? getLine('audio.hizb',
                                    [String(verseData.hizbNumber)]) : '' }}</ion-chip>
                                <ion-chip :outline="true">{{ verseData.pageNumber ? getLine('audio.page',
                                    [String(verseData.pageNumber)]) : '' }}</ion-chip>
                                <ion-chip :outline="true">{{ verseData.juzNumber ? getLine('audio.juz',
                                    [String(verseData.juzNumber)])
                                    : '' }}</ion-chip>
                                <ion-chip :outline="true">{{ verseData.surah ? getLine('audio.surah',
                                    [verseData.surah]) : '' }}</ion-chip>
                                <ion-chip :outline="true">{{ verseData.ayah ? getLine('audio.ayah',
                                    [verseData.ayah]) : '' }}</ion-chip>
                            </ion-text>
                        </ion-text>
                    </ion-col>
                </ion-row>
                <ion-row class="ion-justify-content-center ion-padding-top">
                    <ion-col size="12">
                        <ion-range aria-label="Seek" color="primary"
                            @ion-change="$emit('update:seek', Number($event.detail.value))"
                            :value="Math.round(progressTimer)" :min="0" :max="audioFiles?.duration">
                        </ion-range>
                    </ion-col>
                </ion-row>
                <ion-row class="ion-align-content-center ion-padding-top ion-text-center">
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
                        <ion-button fill="clear" @click="$emit('update:loopAudio', loopButton.emit)"
                            :color="loopButton.color">
                            <ion-icon slot="icon-only" :icon="loopButton.icon"></ion-icon>
                        </ion-button>
                    </ion-col>
                </ion-row>
                <ion-row class="">
                    <ion-col size="12" v-if="isVolumeVisible">
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
                <div v-if="juzs">
                    <audio-modal-all-chapters :juzs="juzs" :chapter-id="audioFiles?.chapter_id"
                        @update:download="$emit('update:download', $event)"
                        @update:play-chapter="$emit('update:playChapter', $event)"></audio-modal-all-chapters>
                </div>
            </ion-grid>
        </ion-content>
    </ion-modal>
</template>
<style scoped>
ion-modal#audio-settings-modal {
    --width: fit-content;
    --min-width: 250px;
    --height: fit-content;
    --border-radius: 6px;
    --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
}

ion-modal#audio-settings-modal h1 {
    margin: 20px 20px 10px 20px;
}

ion-modal#audio-settings-modal ion-icon {
    margin-right: 6px;
    width: 48px;
    height: 48px;
    padding: 4px 0;
    color: #aaaaaa;
}

ion-modal#audio-settings-modal .wrapper {
    margin-bottom: 10px;
}

ul {
    list-style-type: none;
}
</style>