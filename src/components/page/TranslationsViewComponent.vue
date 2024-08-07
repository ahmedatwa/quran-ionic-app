<script lang="ts" setup>
import { ref, computed, watch } from "vue"
import { IonToolbar, IonButtons, IonButton, IonIcon, IonCardHeader } from "@ionic/vue";
import { IonChip, IonContent, IonNote, IonCardSubtitle, IonCardTitle } from "@ionic/vue";
import { IonCol, IonRow, IonGrid, IonItem, IonCard } from "@ionic/vue";
import { IonLabel, IonProgressBar, IonText } from "@ionic/vue";
import { IonInfiniteScrollContent, IonInfiniteScroll } from "@ionic/vue";
// icons
import { arrowBackOutline, arrowForwardOutline, chevronBackOutline, pauseOutline } from "ionicons/icons";
import { playOutline, ellipsisVerticalOutline, languageOutline } from "ionicons/icons";
// utils
import { useLocale } from "@/utils/useLocale";
import { scrollToElement } from "@/utils/useScrollToElement";
import { setStorage } from "@/utils/storage";
import { useRoute, useRouter } from "vue-router";
import { vIntersectionObserver } from "@vueuse/components";
// types
import type { Verse, VerseWord } from "@/types/verse";
import type { PlayAudioEmit, VerseTimingsProps } from "@/types/audio";
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { GroupVersesByChapterID, Pagination } from "@/types/page"
// components
import VerseActionComponent from "@/components/common/VerseActionComponent.vue";
import { useChapterStore } from "@/stores/ChapterStore";

const { getLine } = useLocale()
const { getChapterNameByFirstVerse } = useChapterStore()
const { params } = useRoute()
const { go } = useRouter()
const pageId = computed((): number | undefined => Number(params.pageId))
const intersectingVerseNumber = ref<number>()

const props = defineProps<{
    id: string;
    isTranslationsView: boolean
    isPlaying: boolean
    isLoading: boolean
    translatedBy?: string;
    chapterName?: string
    isBismillah: string
    verses?: GroupVersesByChapterID
    pagination?: Pagination | null
    verseTiming?: VerseTimingsProps
    styles: Record<"fontSize" | "fontFamily" | "fontWeight", string>

}>()

const emit = defineEmits<{
    "update:getVerses": [value: { key: string, nextPage: number }];
    "update:playAudio": [value: PlayAudioEmit];
    "update:modalValue": [value: boolean]
}>();


const onIntersectionObserver = ([{ isIntersecting, target, intersectionRatio }]: IntersectionObserverEntry[]) => {
    if (isIntersecting && intersectionRatio >= 0.8) {
        const verseNumber = Number(target.getAttribute("data-verse-number"));
        intersectingVerseNumber.value = verseNumber
    }
}

// For Element Scroll
watch(intersectingVerseNumber, (newVerseNumber) => {
    if (newVerseNumber) {
        scrollToElement(`#verse-col-${newVerseNumber}`, 300)
    }
})

const setBookmarked = (verse: Verse) => {
    setStorage("bookmark", verse)
};

const ionInfinite = (ev: InfiniteScrollCustomEvent) => {
    if (props.pagination?.next_page) {
        emit("update:getVerses", { key: props.id, nextPage: props.pagination.next_page })
    } else {
        ev.target.complete()
    }
}

const routerBackPath = computed(() => {
    if (props.id) {
        return props.id.split("-")[1]
    }
})

const isWordHighlighted = (word: VerseWord) => {
    if (props.verseTiming) {
        return props.verseTiming.wordLocation === word.location
    }
};
</script>
<template>
    <div class="ion-page" v-show="isTranslationsView" :id="`translations-${id}-${pageId}`">
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-button @click="go(-1)" router-direction="back">
                    <ion-icon :icon="chevronBackOutline"></ion-icon>
                </ion-button>
            </ion-buttons>
            <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
        </ion-toolbar>
        <ion-content class="quran-translation-content-wapper" :fullscreen="true" :scrollY="true">
            <ion-card class="ion-padding card-wrapper" v-for="(verses, chapterId) in verses" :key="chapterId"
                :id="`card-${chapterId}`">
                <div>
                    <ion-chip
                        @click="$emit('update:playAudio', { audioID: verses[0].chapter_id, verseKey: verses[0].verse_key })"
                        color="primary">
                        <ion-icon :icon="isPlaying ? pauseOutline : playOutline"></ion-icon>
                        <ion-label>{{ getLine('quranReader.buttonPlay') }}</ion-label>
                    </ion-chip>
                    <ion-button @click="$emit('update:modalValue', true)" fill="clear" class="ion-float-right">
                        <ion-icon :icon="languageOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </div>
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle> {{ getChapterNameByFirstVerse(verses[0])?.bismillahPre ?
                        getLine("quranReader.textBismillah") : '' }}
                    </ion-card-subtitle>
                    <ion-card-title>{{ getChapterNameByFirstVerse(verses[0])?.nameArabic }} </ion-card-title>
                </ion-card-header>
                <hr>
                <ion-item v-for="verse in verses" :key="verse.verse_number" :data-verse-number="verse.verse_number"
                    :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number">
                    <ion-grid>
                        <ion-row class="ion-align-items-start">
                            <ion-col size="11" class="translations-view-col">
                                <ion-label v-for="word in verse.words" :key="word.id" class="word">
                                    <ion-text :color="isWordHighlighted(word) ? 'primary' : ''">
                                        <h3 v-if="word.char_type_name === 'end'" class="end">
                                            ({{ word.text_uthmani }})</h3>
                                        <h3 :style="styles" v-else>{{ word.text_uthmani }}</h3>
                                    </ion-text>
                                </ion-label>
                            </ion-col>
                            <ion-col size="1">
                                <ion-icon :icon="ellipsisVerticalOutline" color="primary"
                                    :id="`open-action-sheet${verse.verse_number}`"></ion-icon>
                                <verse-action-component :verse="verse"
                                    :trigger-prop="`open-action-sheet${verse.verse_number}`"
                                    @update:bookmarked="setBookmarked"
                                    @update:play-verse-audio="$emit('update:playAudio', $event)">
                                </verse-action-component>
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
                <div v-if="pageId" class="ion-margin-top">
                    <ion-button size="small" fill="clear" v-if="pageId > 1" :router-link="`/page/${pageId - 1}`">
                        <ion-icon :icon="arrowBackOutline" slot="start"></ion-icon>
                        {{ getLine('quranReader.prevPage') }}
                    </ion-button>
                    <ion-button size="small" fill="clear" v-if="pageId <= 604" class="ion-float-right"
                        :router-link="`/page/${pageId + 1}`">
                        <ion-icon :icon="arrowForwardOutline" slot="start"></ion-icon>
                        {{ getLine('quranReader.nextPage') }}
                    </ion-button>
                </div>
            </ion-card>
            <ion-infinite-scroll @ion-infinite="ionInfinite">
                <ion-infinite-scroll-content loading-text="Please wait..."
                    loading-spinner="bubbles"></ion-infinite-scroll-content>
            </ion-infinite-scroll>
        </ion-content>
    </div>
</template>