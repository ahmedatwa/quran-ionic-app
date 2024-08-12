<script lang="ts" setup>
import { ref, computed, watch } from "vue"
import { IonButton, IonIcon, IonCardHeader } from "@ionic/vue";
import { IonChip, IonContent, IonNote, IonCardSubtitle, IonCardTitle } from "@ionic/vue";
import { IonCol, IonRow, IonGrid, IonItem, IonCard } from "@ionic/vue";
import { IonLabel, IonText } from "@ionic/vue";
import { IonInfiniteScrollContent, IonInfiniteScroll } from "@ionic/vue";
// icons
import { arrowBackOutline, arrowForwardOutline, pauseOutline } from "ionicons/icons";
import { playOutline, ellipsisVerticalOutline, languageOutline } from "ionicons/icons";
// utils
import { useLocale } from "@/utils/useLocale";
import { scrollToElement } from "@/utils/useScrollToElement";
import { useStorage } from "@/utils/useStorage";
import { useRoute, useRouter } from "vue-router";
import { vIntersectionObserver } from "@vueuse/components";
import { upperCaseFirst } from "@/utils/string"
// types
import type { Verse, VerseWord } from "@/types/verse";
import type { PlayAudioEmit, VerseTimingsProps } from "@/types/audio";
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { GroupVersesByChapterID, Pagination } from "@/types/page"
// components
import VerseActionComponent from "@/components/common/VerseActionComponent.vue";
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";
// stores
import { useChapterStore } from "@/stores/ChapterStore";

const { getLine } = useLocale()
const { getChapterNameByFirstVerse, getChapterName } = useChapterStore()
const { setStorage, bookmarkedItems } = useStorage("__bookmarksDB")
const { params } = useRoute()
const router = useRouter()
const cardRef = ref()
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
        scrollToElement(`#verse-col-${newVerseNumber}`, cardRef.value.$el, 300)
    }
})

const setBookmarked = async (verse: Verse) => {
    bookmarkedItems.value.push({
        key: `/page/${verse.page_number}`,
        value: {
            pageNumber: verse.page_number,
            verseNumber: verse.verse_number,
            verseText: verse.text_uthmani,
            chapterName: getChapterName(verse.chapter_id)?.nameSimple
        }
    })
    bookmarkedItems.value.forEach(({ key, value }) => {
        setStorage(key, value)
    })

};

const ionInfinite = (ev: InfiniteScrollCustomEvent) => {
    if (props.pagination?.next_page) {
        emit("update:getVerses", { key: props.id, nextPage: props.pagination.next_page })
        setTimeout(() => ev.target.complete(), 500);
    } else {
        ev.target.complete()
    }
}


const isWordHighlighted = (word: VerseWord) => {
    if (props.verseTiming) {
        return props.verseTiming.wordLocation === word.location
    }
};

const routeBackName = computed(() => {
    if (router.options.history.state.back) {
        return upperCaseFirst(router.options.history.state.back.toString().substring(1))
    }
    return upperCaseFirst(getLine("tabs.pages"))
})

</script>
<template>
    <div class="ion-page" v-show="isTranslationsView" :id="`translations-${id}-${pageId}`">
        <toolbar-component :route-back-label="routeBackName" :is-loading="isLoading"></toolbar-component>
        <ion-content class="quran-translation-content-wapper" :fullscreen="true" :scrollY="true" ref="contentRef">
            <ion-card class="ion-padding card-wrapper" v-for="(verses, chapterId) in verses" :key="chapterId"
                :id="`card-${chapterId}`" ref="cardRef">
                <div class="d-flex ion-justify-content-between">
                    <ion-chip
                        @click="$emit('update:playAudio', { audioID: verses[0].chapter_id, verseKey: verses[0].verse_key })"
                        color="primary">
                        <ion-icon :icon="isPlaying ? pauseOutline : playOutline"></ion-icon>
                        <ion-label>{{ getLine('quranReader.buttonPlay') }}</ion-label>
                    </ion-chip>
                    <ion-button @click="$emit('update:modalValue', true)" fill="clear">
                        <ion-icon :icon="languageOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </div>
                <ion-card-header class="ion-text-center">
                    <ion-card-title>{{ getChapterNameByFirstVerse(verses[0])?.nameArabic }} </ion-card-title>
                    <ion-card-subtitle> {{ getChapterNameByFirstVerse(verses[0])?.bismillahPre ?
                        getLine("quranReader.textBismillah") : '' }}
                    </ion-card-subtitle>
                </ion-card-header>
                <hr>
                <ion-item v-for="verse in verses" :key="verse.verse_number" :data-verse-number="verse.verse_number"
                    :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number"
                    :id="`verse-col-${verse.verse_number}`"
                    v-intersection-observer="[onIntersectionObserver, { root: cardRef, immediate: false }]">
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
                            <ion-col size="1" class="action-sheet">
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
                    <ion-button size="small" fill="clear" :disabled="pageId === 1" :router-link="`/page/${pageId - 1}`">
                        <ion-icon :icon="arrowBackOutline" slot="start"></ion-icon>
                        {{ getLine('quranReader.prevPage') }}
                    </ion-button>

                    <ion-button size="small" fill="clear" :disabled="pageId === 604" class="ion-float-right"
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