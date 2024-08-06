<script lang="ts" setup>
import { computed, onMounted, ref, watchEffect, reactive } from "vue"
// ionic
import { IonLabel, IonCardSubtitle, IonProgressBar, IonCardTitle, IonCardHeader } from '@ionic/vue';
import { IonGrid, IonRow, IonCol, IonNote, IonItem, IonContent, IonChip } from '@ionic/vue';
import { IonToolbar, IonButton, IonButtons, IonIcon, IonText, IonCard, IonInfiniteScroll } from "@ionic/vue";
import { IonInfiniteScrollContent, InfiniteScrollCustomEvent } from "@ionic/vue";
import { playOutline, pauseOutline, chevronBackOutline, ellipsisVerticalOutline } from 'ionicons/icons';
// Types
import type { ChapterHeaderData, IntersectingData } from "@/types/chapter";
import type { VerseWord } from "@/types/verse"
import type { IsAudioPlayingProps, PlayAudioEmit } from "@/types/audio"
// stores
import { useJuzStore } from "@/stores/JuzStore";
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";
import { useSettingStore } from "@/stores/SettingStore";
import { useChapterStore } from "@/stores/ChapterStore";
// components
import VerseActionSheet from "@/components/chapters/VerseActionSheet.vue";
import { useLocale } from "@/utils/useLocale";
import { useRoute } from 'vue-router';


const juzStore = useJuzStore()
const audioPlayerStore = useAudioPlayerStore()
const { cssVars } = useSettingStore()
const { getChapterNameByFirstVerse } = useChapterStore()
const audioModelValue = ref(false)
const intersectingVerseNumber = ref<number>()
const { getLine } = useLocale()
const router = useRoute()
const { chapterId } = router.params

const emit = defineEmits<{
    "update:playAudio": [value: PlayAudioEmit];
    "update:headerData": [value: ChapterHeaderData];
    "update:intersectionData": [value: IntersectingData];
}>();

const props = defineProps<{
    isTranslationsView: boolean;
    isAudioPlaying?: IsAudioPlayingProps
    groupedTranslationsAuthors?: string;
    audioExperience?: { autoScroll: boolean; tooltip: boolean };
    defaultStyles: Record<"fontSize" | "fontFamily" | "fontWeight", string>
    selectedVerseNumber?: number;
    wordColor?: string
}>()

const isWordHighlighted = (word: VerseWord) => {
    if (audioPlayerStore.verseTiming && props.isTranslationsView) {
        return audioPlayerStore.verseTiming.wordLocation === word.location
    }
};


const playAudio = async (event: { audioID: number, verseKey?: string }) => {
    await audioPlayerStore.getAudio({ audioID: event.audioID, verseKey: event.verseKey })
    audioModelValue.value = true
}

const itemRefs = ref<HTMLDivElement[]>([])
onMounted(() => {
    itemRefs.value.forEach((e) => {
    })

})

watchEffect(async () => {
    if (audioPlayerStore.audioPlayerSetting.autoScroll) {
        const currentVerseNumber = audioPlayerStore.verseTiming?.verseNumber
        const lastVerseNumber = juzStore.getLastVerseOfJuz
        intersectingVerseNumber.value = Number(audioPlayerStore.verseTiming?.verseNumber)

        if (props.isAudioPlaying?.isPlaying && currentVerseNumber) {
            // fetch more Verses
            if (currentVerseNumber === lastVerseNumber || currentVerseNumber >= lastVerseNumber - 5) {
                if (juzStore.selectedJuz?.pagination?.next_page) {
                    await juzStore.getVerses(juzStore.selectedJuz.juz_number, true, juzStore.selectedJuz.pagination.next_page)
                }
            }
        }
        // toggle active state
        // const element = document.getElementById(`active-${currentVerseNumber}`)
        // if (element) {
        //   isHoveringElement.value = Number(currentVerseNumber)
        // }
    }
});

const ionInfinite = async (ev: InfiniteScrollCustomEvent) => {
    if (juzStore.selectedJuz?.pagination?.next_page) {
        await juzStore.getVerses(juzStore.selectedJuz.juz_number, true, juzStore.selectedJuz?.pagination?.next_page)
        setTimeout(() => ev.target.complete(), 500);
    } else {
        ev.target.complete()
    }

};

const testScroll = (ev: CustomEvent) => {
}

const setBookmarked = (verseNumber: number) => {
    juzStore.selectedJuz?.verses?.forEach((v) => {
        if (v.verse_number === verseNumber) {
            v.bookmarked = true
        }
    });
};



</script>


<template>
    <div class="ion-page" v-if="isTranslationsView">
        <ion-toolbar color="light">
            <ion-buttons slot="start">
                <ion-button :router-link="'/juzs'" router-direction="back">
                    <ion-icon :icon="chevronBackOutline"></ion-icon>
                </ion-button>
            </ion-buttons>
            <ion-buttons slot="end">
                <ion-chip @click="playAudio({ audioID: Number(chapterId) })" color="primary">
                    <ion-icon color="primary"
                        :icon="audioPlayerStore.isPlaying ? pauseOutline : playOutline"></ion-icon>
                    <ion-label>Play Audio</ion-label>
                </ion-chip>
            </ion-buttons>
            <ion-progress-bar type="indeterminate" v-if="juzStore.isLoading"></ion-progress-bar>
        </ion-toolbar>
        <ion-content class="quran-translation-content-wapper" :fullscreen="true" :scroll-events="true" @ionScroll="testScroll">
            <ion-card class="ion-padding" v-for="(verses, chapterId) in juzStore.juzVersesByChapterMap" :key="chapterId"
                :id="`card-${chapterId}`">
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle> {{ getChapterNameByFirstVerse(verses[0])?.bismillahPre ?
                        getLine("quranReader.textBismillah") : '' }}
                    </ion-card-subtitle>
                    <ion-card-title>{{ getChapterNameByFirstVerse(verses[0])?.nameArabic }} </ion-card-title>
                </ion-card-header>
                <hr>
                <ion-item v-for="verse in verses" :key="verse.verse_number" :data-verse-number="verse.verse_number"
                    :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number" ref="itemRefs">
                    <ion-grid>
                        <ion-row class="ion-align-items-start">
                            <ion-col size="11" class="translations-view-col">
                                <ion-label v-for="word in verse.words" :key="word.id" class="word">
                                    <ion-text :color="isWordHighlighted(word) ? 'primary' : ''">
                                        <h3 v-if="word.char_type_name === 'end'" class="end">
                                            ({{ word.text_uthmani }})</h3>
                                        <h3 :style="[defaultStyles, cssVars]" v-else>{{ word.text_uthmani }}</h3>
                                    </ion-text>
                                </ion-label>
                            </ion-col>
                            <ion-col size="1">
                                <ion-icon :icon="ellipsisVerticalOutline" color="primary"
                                    :id="`open-action-sheet${verse.verse_number}`"></ion-icon>
                                <verse-action-sheet :verse="verse"
                                    :trigger-prop="`open-action-sheet${verse.verse_number}`"
                                    @update:bookmarked="setBookmarked"
                                    @update:play-verse-audio="playAudio({ ...$event })"></verse-action-sheet>
                            </ion-col>
                            <ion-col size="12" class="ion-text-left">
                                <ion-note v-for="translation in verse.translations" :key="translation.id"
                                    class="translation ">
                                    <span v-html="translation.text"></span>
                                </ion-note>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-item>
            </ion-card>
            <ion-infinite-scroll @ionInfinite="ionInfinite">
                <ion-infinite-scroll-content loading-text="Please wait..."
                    loading-spinner="bubbles"></ion-infinite-scroll-content>
            </ion-infinite-scroll>
        </ion-content>
    </div>
</template>
<style scoped></style>