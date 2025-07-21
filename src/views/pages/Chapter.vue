<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted, shallowRef, watch, nextTick } from 'vue';
import { IonContent, IonButton, IonPage } from '@ionic/vue';
import { storeToRefs } from 'pinia';
// components
import TranslationsViewComponent from '@/components/chapter/TranslationsViewComponent.vue';
import ReadingViewComponent from '@/components/chapter/ReadingViewComponent.vue';
import ChapterInfoModalComponent from '@/components/chapter/ChapterInfoModalComponent.vue';
import SegmentsComponent from '@/components/common/SegmentsComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
// Route
import { useRoute } from 'vue-router';
// stores
import { useChapterStore } from "@/stores/ChapterStore"
import { useAudioStore } from "@/stores/AudioStore";
import { useTranslationsStore } from '@/stores/TranslationsStore';
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useJuzStore } from '@/stores/JuzStore';

// composables
import { useSettings } from '@/composables/useSettings';
import { useAudioFile } from '@/composables/useAudioFile';
import { useVerseTiming } from '@/composables/useVerseTiming';
import { useAlert } from "@/composables/useAlert"

// types
import type { ChapterInfo } from '@/types/chapter';
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { Verse } from "@/types/verse"

const currentSegment = ref("translations")
const chapterStore = useChapterStore()
const audioStore = useAudioStore()
const recitionsStore = useRecitionsStore()
const { selectedTranslationId, selectedTranslation } = storeToRefs(useTranslationsStore())
const { juzList } = storeToRefs(useJuzStore())
const { downloadFileProgress } = useAudioFile()
const { verseTiming } = useVerseTiming()
const { presentLoading } = useAlert()
const pageRef = ref()
const pageRefEl = ref()
const chapterInfoModalRef = ref()
const perPage = shallowRef(20)
const searchValue = shallowRef("");
const { computedCSS } = useSettings()
const chapterInfo = ref<ChapterInfo | null>(null)
const currentPageEnd = shallowRef()
const pagination = computed(() => chapterStore.selectedChapter?.pagination)
const { params } = useRoute()
const chapterId = computed(() => Number(params.chapterId))
const chapterSlug = computed(() => params.slug)
const currentVerseNumberFromTiming = computed(() => verseTiming.value?.verseNumber)
const snapToNewVerseNumber = ref<number | undefined>()
const loadingVerses = ref(false)

// verses
const computedVerses = computed(() => {
    return chapterStore.selectedChapter?.verses?.filter
        (({ verse_number }) => verse_number.toString().includes(searchValue.value))
        .sort((a, b) => a.verse_number - b.verse_number)
})

watchEffect(async () => {
    if (chapterId.value) {
        chapterStore.selectedChapter = null
        const found = chapterStore.chaptersList?.find((c) => c.id === chapterId.value || c.slug === chapterSlug.value)
        if (found) {
            if (!found.verses?.length) {
                await chapterStore.getVerses(found.id, true)
                const verses = chapterStore.verses?.slice(0, perPage.value)
                if (verses) {
                    chapterStore.selectedChapter = found
                    verses.forEach((v) => chapterStore.selectedChapter?.verses?.push({ ...v, bookmarked: false }))
                }
            } else {
                chapterStore.selectedChapter = found
            }

        }
    }
})

const isPlaying = computed(() => audioStore.isPlaying
    && audioStore.chapterId === chapterStore.selectedChapter?.id)

const playAudio = async (event: { audioID: number, verseKey?: string }) => {
    if (event.audioID === audioStore.chapterId) {
        await audioStore.handlePlay(true);
        return;
    }
    audioStore.resetValues()
    await audioStore.getAudio({ audioID: event.audioID, verseKey: event.verseKey })
}

const loadMoreVerses = (infiniteScrollEvent: InfiniteScrollCustomEvent) => {
    if (computedVerses.value?.length === chapterStore.versesTotalRecords) {
        infiniteScrollEvent.target.complete()
    } else {
        fetchMoreVerses(infiniteScrollEvent)
    }
}

onMounted(() => pageRefEl.value = pageRef.value.$el)

const getSurahInfo = async (ev: number) => {
    await chapterStore.getchapterInfo(ev).then((response) => {
        chapterInfo.value = response.data.chapter_info
    })
    chapterInfoModalRef.value.$el.click()
}

/**
 * watch App State 
 * compare verse number in verse timing with chapter verses 
 * if not located keep fetching till found 
 * for scroll to work if being inactive
 */
watch(
    () => audioStore.appState,
    async (state) => {
        if (state === true) {
            await fetchMoreVerses()
        }

    })

const fetchMoreVerses = async (infiniteScrollEvent?: InfiniteScrollCustomEvent) => {
    if (infiniteScrollEvent) {
        if (computedVerses.value) {
            loadingVerses.value = true
            currentPageEnd.value = Math.ceil(computedVerses.value?.length + perPage.value)
            const verses = chapterStore.verses?.slice(computedVerses.value?.length, currentPageEnd.value)
            if (verses) {
                verses.forEach((v) => chapterStore.selectedChapter?.verses?.push({ ...v, bookmarked: false }))
                setTimeout(() => {
                    if (infiniteScrollEvent) infiniteScrollEvent.target.complete()
                    loadingVerses.value = false
                }, 200);
            }
        }
    } else {
        // look for number in chapter verses 
        const toBFoundVerse: Verse | undefined = computedVerses.value?.find(
            (v) => v.verse_number === currentVerseNumberFromTiming.value)

        if (!toBFoundVerse) {
            await presentLoading("loading-verses", false)
            const lastVerseInComputedVerses = computedVerses.value?.slice(-1)[0]
            if (lastVerseInComputedVerses?.verse_number && currentVerseNumberFromTiming.value) {
                const calc = Math.ceil(currentVerseNumberFromTiming.value - lastVerseInComputedVerses?.verse_number)
                if (computedVerses.value) {
                    currentPageEnd.value = Math.ceil(computedVerses.value?.length + calc)
                    const verses = chapterStore.verses?.slice(computedVerses.value?.length, (currentPageEnd.value + 1))
                    if (verses) {
                        verses.forEach((v) => chapterStore.selectedChapter?.verses?.push({ ...v, bookmarked: false }))
                        await nextTick(async () => {
                            if (computedVerses.value) {
                                if (computedVerses.value?.length >= calc)
                                    snapToNewVerseNumber.value = currentPageEnd.value
                                loadingVerses.value = true
                            }
                        })

                    }
                }
            }
        }
    }
}

/**
 * watch audio seek 
 * then feed the verse number value 
 * to translation component for scroll
 * to correct html element
 */

watch(() => audioStore.playbackSeekedValue, async (num) => {
    if (num) {     
        await fetchMoreVerses()
    }
})
</script>
<template>
    <ion-page :data-chapter-id="chapterId" ref="pageRef">
        <segments-component :selected-segment="currentSegment"
            @update:selected-segment="currentSegment = $event"></segments-component>
        <ion-content>
            <translations-view-component id="translations-chapters" :key="chapterId" :is-loading="loadingVerses"
                :is-playing="isPlaying" v-if="currentSegment === 'translations'" :chapter-id="chapterId"
                :download-progress="downloadFileProgress" :is-audio-loading="audioStore.isLoading"
                @update:play-audio="playAudio" :is-bismillah="chapterStore.selectedChapterBismillah"
                :styles="computedCSS" :last-chapter-verse="chapterStore.getLastVerseNumberOfChapter" :per-page="perPage"
                :verse-count="chapterStore.versesTotalRecords" @update:get-verses="loadMoreVerses"
                :pagination="pagination" :verses="computedVerses" @update:search-value="searchValue = $event"
                :chapter-name="chapterStore.selectedChapterName.nameArabic" :new-verse-snap="snapToNewVerseNumber"
                @update:selected-translation="selectedTranslation = $event" :verse-timing="verseTiming"
                :audio-experience="audioStore.audioPlayerSetting" :selected-translation-id="selectedTranslationId"
                @update:loading-verses="loadingVerses = false" :playback-seeked="audioStore.playbackSeekedValue"
               >
            </translations-view-component>
            <reading-view-component id="reading-chapters" v-else :is-playing="isPlaying" :verses="computedVerses"
                :is-loading="chapterStore.isLoading.verses" :styles="computedCSS" :chapter-id="chapterId"
                @update:get-verses="loadMoreVerses" :is-audio-loading="audioStore.isLoading" :per-page="perPage"
                @update:surah-info="getSurahInfo" :pagination="pagination" @update:play-audio="playAudio"
                :download-progress="downloadFileProgress" :audio-experience="audioStore.audioPlayerSetting"
                :verse-count="chapterStore.versesTotalRecords" :verse-timing="verseTiming">
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