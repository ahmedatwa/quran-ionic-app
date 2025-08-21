<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted, watch } from 'vue';
import { IonContent, IonButton, IonPage } from '@ionic/vue';
import { storeToRefs } from 'pinia';
// components
import TranslationsViewComponent from '@/components/chapter/TranslationsViewComponent.vue';
import ReadingViewComponent from '@/components/chapter/ReadingViewComponent.vue';
import ChapterInfoModalComponent from '@/components/chapter/ChapterInfoModalComponent.vue';
import SegmentsComponent from '@/components/common/SegmentsComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
// Route
import { useRoute, useRouter } from 'vue-router';
// stores
import { useChapterStore } from "@/stores/ChapterStore"
import { useAudioStore } from "@/stores/AudioStore";
import { useTranslationsStore } from '@/stores/TranslationsStore';
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useJuzStore } from '@/stores/JuzStore';
// composables
import { useSettings } from '@/composables/useSettings';
import { useAudioFile } from '@/composables/useAudioFile';
import { useMetaData } from '@/composables/useMetaData';
import { useLocale } from '@/composables/useLocale';
// types
import type { ChapterInfo } from '@/types/chapter';
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { Verse } from '@/types/verse';


const currentSegment = ref("translations")
const chapterStore = useChapterStore()
const audioStore = useAudioStore()
const recitionsStore = useRecitionsStore()
const { getLine } = useLocale()
const { setMetaData, setPageTitle } = useMetaData()
const { selectedTranslationId, selectedTranslation } = storeToRefs(useTranslationsStore())
const { juzList } = storeToRefs(useJuzStore())
const { downloadFileProgress } = useAudioFile()
const pageRef = ref()
const pageRefEl = ref()
const chapterInfoModalRef = ref()
const { computedCSS } = useSettings()
const chapterInfo = ref<ChapterInfo | null>(null)
const { params } = useRoute()
const { push } = useRouter()
const chapterId = computed(() => Number(params.chapterId))

const computedVerses = computed(() =>
    chapterStore.selectedChapterVerses.filter((f) =>
        f.verse_number.toString().includes(chapterStore.searchVerseNumberValue)
    ))

/**
 * listen to url changes 
 * so respected verses could be fetched and stored
 */
watchEffect(async () => {
    if (chapterId.value) {
        const chapterIsFound = chapterStore.validateSelectedChapterVerses(chapterId.value, chapterStore.perPage)
        if (chapterIsFound) {
            chapterStore.allVerses = []
            chapterStore.selectedChapter = null
            chapterStore.selectedChapterVerses = []
            chapterStore.loadingVerses = true
            if (!chapterIsFound.isValidVerseLength) {
                await chapterStore.getVerses(chapterId.value).then(() => {
                    if (chapterStore.allVerses?.length) {
                        chapterStore.selectedChapter = chapterIsFound.chapterData
                        chapterStore.allVerses?.slice(0, chapterStore.perPage).forEach((v) => chapterStore.selectedChapterVerses?.push({ ...v, bookmarked: false }))
                    }
                }).finally(() => { })
                chapterStore.loadingVerses = false

            } else {
                chapterStore.selectedChapter = chapterIsFound.chapterData
            }
        }
    }
})

const loadMoreVerses = async (infiniteScrollEvent: InfiniteScrollCustomEvent) => {
    if (chapterStore.selectedChapterVerses?.length === chapterStore.versesTotalRecords) {
        infiniteScrollEvent.target.complete()
    } else {
        await chapterStore.fetchMoreChapterVerses(infiniteScrollEvent)
    }
}

onMounted(() => {
    setPageTitle(getLine("metaChapter.view"))
    setMetaData([{
        name: "keywords",
        content: "chapter, surah, quran, fatihah, Al-Baqarah, quran"
    }, {
        name: "description",
        content: "list for all quran surahs/chapters"
    }])
    pageRefEl.value = pageRef.value.$el
})

const getSurahInfo = async (ev: number) => {
    await chapterStore.getchapterInfo(ev).then((response) => {
        chapterInfo.value = response.data.chapter_info
    })
    chapterInfoModalRef.value.$el.click()
}


/**
 * auto fetch verses 
 * every 20s 
 */
watchEffect(() => {
    if (audioStore.isPlayingState) {
        if (chapterStore.selectedChapterVerses?.length !== chapterStore.versesTotalRecords) {
            const intervalId = setInterval(() => {

                if (chapterStore.selectedChapterVerses) {
                    chapterStore.allVerses.slice(chapterStore.selectedChapterVerses.length, Math.ceil(chapterStore.perPage + chapterStore.selectedChapterVerses.length)).forEach((v: Verse) =>
                        chapterStore.selectedChapterVerses.push({
                            ...v,
                            bookmarked: false,
                        })
                    );
                }
                if (chapterStore.selectedChapterVerses.length === chapterStore.versesTotalRecords) {
                    clearInterval(intervalId)
                }
            }, 20000)
        } else {
            return
        }
    }
})

watch(currentSegment, (s) => {
    if (s === "home") {
        push({ path: "/chapters", replace: true })
    }
})

/**
 * handle the verse search 
 * if verse located in current length 
 * fee the $chapterStore 
 * or fetch new Verses to the $selectedChapterVerses
 * @param verseNumber 
 */
const handleVerseNumberSearch = (verseNumber: string) => {
    const verseFound = chapterStore.selectedChapterVerses.find((v) => v.verse_number === Number(verseNumber))
    if (verseFound) {
        chapterStore.searchVerseNumberValue = verseNumber
    } else {
        const start = chapterStore.selectedChapterVerses.length        
        chapterStore.allVerses.slice(start, Number(verseNumber)).forEach((v: Verse) =>
            chapterStore.selectedChapterVerses.push({
                ...v,
                bookmarked: false,
            })
        );
        chapterStore.searchVerseNumberValue = verseNumber
    }
}
</script>
<template>
    <ion-page :data-chapter-id="chapterId" ref="pageRef" :key="`chapter-${chapterId}`">
        <segments-component :selected-segment="currentSegment"
            @update:selected-segment="currentSegment = $event"></segments-component>
        <ion-content>
            <translations-view-component v-if="currentSegment === 'translations'"
                :id="`chapter-translations-${chapterId}`" :key="`chapter-translations-${chapterId}`"
                :is-loading="chapterStore.loadingVerses" :is-playing="audioStore.isPlayingState" :chapter-id="chapterId"
                :download-progress="downloadFileProgress" :is-audio-loading="audioStore.isLoading"
                @update:play-audio="audioStore.handlePlayAudio" :is-bismillah="chapterStore.selectedChapterBismillah"
                :styles="computedCSS" :last-chapter-verse="chapterStore.getLastVerseNumberOfChapter"
                :per-page="chapterStore.perPage" :verse-count="chapterStore.versesTotalRecords"
                @update:get-verses="loadMoreVerses" :verses="computedVerses" :audio-src="audioStore.audioPayLoadSrc"
                @update:search-value="handleVerseNumberSearch"
                :chapter-name="chapterStore.selectedChapterName.nameArabic"
                @update:selected-translation="selectedTranslation = $event"
                :audio-experience="audioStore.audioPlayerSetting" :selected-translation-id="selectedTranslationId"
                @update:loading-verses="chapterStore.loadingVerses = $event"
                :playback-seeked="audioStore.playbackSeekedValue">
            </translations-view-component>
            <reading-view-component v-else :id="`chapter-reading-${chapterId}`" :key="`chapter-reading-${chapterId}`"
                :is-loading="chapterStore.loadingVerses" :is-playing="audioStore.isPlayingState" :chapter-id="chapterId"
                :download-progress="downloadFileProgress" :is-audio-loading="audioStore.isLoading"
                @update:play-audio="audioStore.handlePlayAudio" :is-bismillah="chapterStore.selectedChapterBismillah"
                :styles="computedCSS" :last-chapter-verse="chapterStore.getLastVerseNumberOfChapter"
                :per-page="chapterStore.perPage" :verse-count="chapterStore.versesTotalRecords"
                @update:get-verses="loadMoreVerses" :verses="computedVerses" :audio-src="audioStore.audioPayLoadSrc"
                @update:search-value="handleVerseNumberSearch"
                :chapter-name="chapterStore.selectedChapterName.nameArabic"
                @update:selected-translation="selectedTranslation = $event"
                :audio-experience="audioStore.audioPlayerSetting" :selected-translation-id="selectedTranslationId"
                @update:loading-verses="chapterStore.loadingVerses = $event"
                :playback-seeked="audioStore.playbackSeekedValue" @update:surah-info="getSurahInfo">
            </reading-view-component>
            <div>
                <ion-button ref="chapterInfoModalRef" id="chapter-modal-info" class="ion-hide"></ion-button>
                <chapter-info-modal-component trigger="chapter-modal-info" :chapter-info="chapterInfo"
                    :page-el="pageRefEl">
                </chapter-info-modal-component>
            </div>
        </ion-content>
        <div class="footer">
            <audio-player-component :model-value="audioStore.isVisible"
                :selected-reciter="recitionsStore.selectedReciter" @update:model-value="audioStore.isVisible = $event"
                :map-recitions="recitionsStore.mapRecitions"
                @update:selected-reciter="recitionsStore.handleSelectedReciter($event)" :juz-list="juzList">
            </audio-player-component>
        </div>
    </ion-page>
</template>