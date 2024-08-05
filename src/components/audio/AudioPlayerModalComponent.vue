<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { IonButtons, IonButton, IonHeader, IonToolbar, IonSkeletonText, IonList } from "@ionic/vue"
import { IonContent, modalController, IonRow, IonLabel, IonThumbnail, IonItem } from '@ionic/vue';
import { IonRange, IonCol, IonGrid, IonIcon, IonImg, IonNote, IonAlert } from '@ionic/vue';
import { playOutline, playBackOutline, playForwardOutline } from 'ionicons/icons';
import { pauseOutline, chevronDownOutline, ellipsisHorizontalOutline } from 'ionicons/icons';
import { volumeOffOutline, volumeHighOutline, repeatOutline } from 'ionicons/icons';
// stores
import { useAudioPlayerStore } from '@/stores/AudioPlayerStore';
import { useChapterStore } from "@/stores/ChapterStore";
// utils
import { milliSecondsToSeconds, secondsToMilliSeconds } from "@/utils/datetime"
import { useLocale } from "@/utils/useLocale";

const audioPlayerStore = useAudioPlayerStore()
const { chapters, getVerseByVerseKey } = useChapterStore()
const { getLine, isRtl } = useLocale()
const isImgLoading = ref(true)
const pinFormatter = (value: number) => `${value}%`
const cancel = () => modalController.dismiss(null, 'cancel');
const audioPlayerRef = ref<HTMLAudioElement>()

const changeMediaVolume = (ev: CustomEvent) => {
    if (audioPlayerRef.value) {
        audioPlayerStore.mediaVolume = ev.detail.value
        audioPlayerRef.value.volume = audioPlayerStore.mediaVolume / 100
    }
}

const playbackSeek = () => {
    if (audioPlayerRef.value) {
        audioPlayerRef.value.currentTime = milliSecondsToSeconds(
            audioPlayerStore.progressTimer
        );
        audioPlayerStore.progressTimer = secondsToMilliSeconds(
            audioPlayerRef.value.currentTime
        );
    }
};

const playAudio = () => {
    if (audioPlayerRef.value) {
        if (audioPlayerRef.value.paused) {
            audioPlayerRef.value.play();
            audioPlayerStore.isPlaying = true;
        } else {
            audioPlayerRef.value.pause();
            audioPlayerStore.isPlaying = false;
        }
    }
};

onMounted(() => {
    audioPlayerRef.value = document.querySelector("#audioPlayerRef") as HTMLAudioElement
})

const playChapterAudio = (audioID: number) => {
    audioPlayerStore.getAudio({ audioID })
}

const getCurrentVerseData = computed(() => {
    const timing = audioPlayerStore.verseTiming
    if (timing) {
        const verseKey = String(timing.verseKey)
        const verse = getVerseByVerseKey(verseKey)
        console.log(verse);
        if (verse) {
            return {
                juzNumber: verse.juz_number,
                hizbNumber: verse.hizb_number,
                pageNumber: verse.page_number
            }

        }
    }
})

const alertInputs = computed(() => {
    return audioPlayerStore.recitations.map((r) => {
        return {
            label: r.name + ' - ' + r.style.name,
            type: 'radio',
            value: r
        }
    })
})
</script>

<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-button color="medium" @click="cancel">
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
                        :src="`/reciters/${audioPlayerStore.selectedReciter.reciter_id}.jpg`"
                        :alt="audioPlayerStore.selectedReciter.name"></ion-img>
                </ion-col>
            </ion-row>
            <ion-row>
                <ion-col size="12">
                    <ion-text class="ion-padding-vertical">
                        <ion-text>
                            <h3>{{ audioPlayerStore.chapterName }}</h3>
                        </ion-text>
                        <ion-text>
                            <h4>{{ audioPlayerStore.selectedReciter.name }}</h4>
                        </ion-text>
                        <ion-text>
                            <p>Hizb {{ getCurrentVerseData?.hizbNumber }} | Page {{ getCurrentVerseData?.pageNumber }} |
                                Juz {{ getCurrentVerseData?.juzNumber }}</p>
                        </ion-text>
                    </ion-text>
                </ion-col>
            </ion-row>
            <ion-row class="ion-justify-content-center">
                <ion-col size="12">
                    <ion-range aria-label="Seek" color="primary" @ion-change="playbackSeek" :pin="true"
                        :pin-formatter="pinFormatter" :value="audioPlayerStore.progressTimer / 1000" :min="0"
                        :max="audioPlayerStore.duration">
                    </ion-range>
                </ion-col>
            </ion-row>
            <ion-row class="ion-align-items-stretch">
                <ion-col size="12">
                    <ion-button fill="clear" @click="audioPlayerStore.playPrevious" id="present-alert">
                        <ion-icon :icon="ellipsisHorizontalOutline" size="large" color="primary"></ion-icon>
                        <ion-alert trigger="present-alert" :header="getLine('audio.selectReciter')"
                            :buttons="['Cancel', 'OK']" :inputs="alertInputs"></ion-alert>
                    </ion-button>
                    <ion-button fill="clear" @click="audioPlayerStore.playPrevious">
                        <ion-icon :icon="playBackOutline" size="large" color="primary"></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" @click="playAudio">
                        <ion-icon :icon="audioPlayerStore.isPlaying ? pauseOutline : playOutline" size="large"
                            color="primary"></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" @click="audioPlayerStore.playNext">
                        <ion-icon :icon="playForwardOutline" size="large" color="primary"></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" v-if="audioPlayerStore.loopAudio === 'none'"
                        @click="audioPlayerStore.loopAudio = 'repeat'">
                        <ion-icon :icon="repeatOutline" size="large" color="medium"></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" v-else-if="audioPlayerStore.loopAudio === 'repeat'"
                        @click="audioPlayerStore.loopAudio = 'none'">
                        <ion-icon :icon="repeatOutline" size="large" color="primary"></ion-icon>
                    </ion-button>
                </ion-col>
            </ion-row>
            <ion-row class="ion-justify-content-center">
                <ion-col size="12">
                    <ion-range aria-label="Volume" @ion-change="changeMediaVolume" :pin="true"
                        :pin-formatter="pinFormatter" :value="audioPlayerStore.mediaVolume * 100">
                        <ion-icon slot="start" :icon="volumeOffOutline"></ion-icon>
                        <ion-icon slot="end" :icon="volumeHighOutline"></ion-icon>
                    </ion-range>
                </ion-col>
            </ion-row>
            <ion-row class="ion-justify-content-center ion-margin-vertical">
                <ion-col size="12">
                    <ion-list style="height: 400px; overflow-y: scroll;" class="ion-padding">
                        <ion-item :button="true" v-for="chapter in chapters" :key="chapter.id"
                            @click="playChapterAudio(chapter.id)">
                            <ion-label class="d-flex">
                                <span v-if="isRtl">{{ chapter.nameArabic }}</span>
                                <span v-else>{{ chapter.nameSimple }}</span>
                            </ion-label>
                            <ion-note class="ion-text-wrap">{{ audioPlayerStore.selectedReciter.name }}</ion-note>
                        </ion-item>
                    </ion-list>
                </ion-col>
            </ion-row>
        </ion-grid>

    </ion-content>
</template>
<style scoped>
.d-none {
    display: none;
}
</style>