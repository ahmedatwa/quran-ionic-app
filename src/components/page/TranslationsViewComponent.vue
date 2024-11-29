<script lang="ts" setup>
import { ref, computed, watch } from "vue"
import { IonButton, IonIcon, IonCardHeader } from "@ionic/vue";
import { IonContent, IonNote, IonCardSubtitle, IonCardTitle } from "@ionic/vue";
import { IonCol, IonRow, IonGrid, IonItem, IonCard, IonRefresher, IonRefresherContent } from "@ionic/vue";
import { IonLabel, IonText } from "@ionic/vue";
import { IonInfiniteScrollContent, IonInfiniteScroll } from "@ionic/vue";
// icons
import { arrowBackOutline, arrowForwardOutline, ellipsisVerticalOutline } from "ionicons/icons";
// utils
import { useLocale } from "@/utils/useLocale";
import { scrollToElement } from "@/utils/useScrollToElement";
import { useStorage } from "@/utils/useStorage";
import { useRoute, useRouter } from "vue-router";
import { upperCaseFirst } from "@/utils/string"
import { useAlert } from '@/utils/useAlert';
// types
import type { Verse, VerseWord } from "@/types/verse";
import type { PlayAudioEmit, VerseTimingsProps } from "@/types/audio";
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { GroupVersesByChapterID, Pagination } from "@/types/page"
import type { RefresherCustomEvent } from "@ionic/vue"
// components
import VerseActionComponent from "@/components/common/VerseActionComponent.vue";
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";
import CardHeaderButtonsComponent from "@/components/common/CardHeaderButtonsComponent.vue";
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
const { presentAlert } = useAlert()

const props = defineProps<{
    id: string;
    isTranslationsView?: boolean
    downloadProgress?: string | number
    isPlaying: boolean
    isLoading: boolean
    isAudioLoading: boolean
    translatedBy?: string;
    audioExperience: { autoScroll: boolean; tooltip: boolean };
    chapterName?: string
    isBismillah: string
    verses?: GroupVersesByChapterID
    pagination?: Pagination | null
    verseTiming?: VerseTimingsProps
    activeAudioId?: number
    styles: Record<"fontSize" | "fontFamily" | "fontWeight" | "colorCode", string>
}>()

const emit = defineEmits<{
    "update:getVerses": [value: { key: string, nextPage: number }];
    "update:playAudio": [value: PlayAudioEmit];
    "update:modalValue": [value: boolean]
}>();


// scrolling based on verseNumber sent by audioStore
watch(() => props.verseTiming, (t) => {
    if (t?.verseNumber) {
        const verseNumber = t.verseNumber
        if (props.audioExperience.autoScroll && props.isPlaying) {
            intersectingVerseNumber.value = t.verseNumber
            scroll(verseNumber)
        }
    }
})

const setBookmarked = async (verse: Verse) => {
    const v = bookmarkedItems.value.find(({ key }) => {
        const vNumber = key.split("-").pop()
        return Number(vNumber) === verse.verse_number

    })
    if (!v) {
        bookmarkedItems.value.push({
            key: `/page/${verse.page_number}-${verse.verse_number}`,
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

        await presentAlert({
            message: getLine("quranReader.verseBookmarked"),
        })
    } else {
        await presentAlert({
            message: getLine("quranReader.verseAlreadyBookmarked"),
        })
    }
};

const ionInfinite = (ev: InfiniteScrollCustomEvent) => {
    if (props.pagination?.next_page) {
        loadMoreVerses()
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

const loadMoreVerses = () => {
    if (props.pagination?.next_page) {
        emit("update:getVerses", { key: props.id, nextPage: props.pagination?.next_page })
    }
}

const scroll = (verseNumber: number) => scrollToElement(`#verse-col-${verseNumber}`, cardRef.value.$el, 300)

const handleRefresh = (event: RefresherCustomEvent) => {
    if (!props.pagination?.next_page) {
        event.target?.complete();
    }

    setTimeout(() => {
        loadMoreVerses()
        event.target?.complete();
    }, 500);
};

const isPlaying = (chapterId: number) => {
    return props.isPlaying && chapterId === props.activeAudioId
}
</script>
<template>
    <div class="ion-page" :id="`translations-${id}-${pageId}`">
        <toolbar-component :route-back-label="routeBackName" :is-loading="isLoading"></toolbar-component>
        <ion-content class="quran-translation-content-wapper" :fullscreen="true" :scrollY="true" ref="contentRef">
            <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <ion-card class="ion-padding card-wrapper" v-for="(verses, chapterId) in verses" :key="chapterId"
                :id="`card-${chapterId}`" ref="cardRef">
                <card-header-buttons-component :chapter-id="verses[0].chapter_id" :download-progress="downloadProgress"
                    :verse-key="verses[0].verse_key" :is-playing="isPlaying(verses[0].chapter_id)"
                    @update:play-audio="$emit('update:playAudio', $event)" :is-audio-loading="isAudioLoading"
                    @update:language-modal-value="$emit('update:modalValue', $event)">
                </card-header-buttons-component>
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle> {{ getChapterNameByFirstVerse(verses[0])?.bismillahPre ?
                        getLine("quranReader.textBismillah") : '' }}
                    </ion-card-subtitle>
                    <ion-card-title>{{ getChapterNameByFirstVerse(verses[0])?.nameArabic }} </ion-card-title>
                </ion-card-header>
                <hr>
                <ion-item v-for="verse in verses" :key="verse.verse_number" :data-verse-number="verse.verse_number"
                    :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number"
                    :id="`verse-col-${verse.verse_number}`">
                    <ion-grid>
                        <ion-row class="ion-align-items-start">
                            <ion-col size="11" class="translations-view-col">
                                <ion-label v-for="word in verse.words" :key="word.id" class="word">
                                    <ion-text :color="isWordHighlighted(word) ? styles.colorCode : ''">
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
                            <ion-col size="11" class="ion-text-left">
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