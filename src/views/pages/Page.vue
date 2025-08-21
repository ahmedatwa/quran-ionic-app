<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted, shallowRef, watch, nextTick } from 'vue';
import { IonContent, IonPage, IonButton } from '@ionic/vue';
import { storeToRefs } from 'pinia';
// components
import TranslationsViewComponent from '@/components/page/TranslationsViewComponent.vue';
import ReadingViewComponent from '@/components/page/ReadingViewComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import ChapterInfoModalComponent from '@/components/chapter/ChapterInfoModalComponent.vue';
import SegmentsComponent from '@/components/common/SegmentsComponent.vue';
import { useRoute, useRouter } from "vue-router";
// stores
import { usePageStore } from "@/stores/PageStore"
import { useAudioStore } from "@/stores/AudioStore";
import { useTranslationsStore } from '@/stores/TranslationsStore';
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useChapterStore } from '@/stores/ChapterStore';
import { useJuzStore } from '@/stores/JuzStore';
// composables
import { useSettings } from '@/composables/useSettings';
import { useAlert } from '@/composables/useAlert';
import { useAudioFile } from '@/composables/useAudioFile';
import { useLocale } from '@/composables/useLocale';
import { useMetaData } from '@/composables/useMetaData';
// types
import type { GroupVersesByChapterID } from "@/types/page"
import type { ChapterInfo } from '@/types/chapter';
import type { PlayAudioEmit } from "@/types/audio";



const currentSegment = ref("translations")
const pageStore = usePageStore()
const { presentAlert, presentToast } = useAlert()
const { getLine } = useLocale()
const { setMetaData, setPageTitle } = useMetaData()
const { computedCSS } = useSettings()
const recitionsStore = useRecitionsStore()
const { juzList } = storeToRefs(useJuzStore())
const { selectedTranslation, selectedTranslationId } = storeToRefs(useTranslationsStore())
const { selectedChapterName, selectedChapterBismillah, getchapterInfo, getTotalVersesOfChapter } = useChapterStore()
const audioStore = useAudioStore()
const { downloadFileProgress } = useAudioFile()
const pagination = computed(() => pageStore.selectedPage?.pagination)
const pageRef = ref()
const pageRefEl = ref()
const chapterInfo = ref<ChapterInfo | null>(null)
const chapterInfoButtonRef = ref()
const route = useRoute()
const router = useRouter()
const perPage = shallowRef(30)
const lastIntersectingVerseOfPage = shallowRef<{ verseNumber: number, chapterId: number }>()
const currentPageId = shallowRef<number>()
const isFirstVerseOfVerses = computed(() => pageStore.getFirstVerseOfSeletedPage?.verse_number)

/** 
 * entry point for storing verses 
 * based on URL pageId param change
 */
watchEffect(async () => {
    if (currentPageId.value) {
        if (pageStore.pagesList) {
            pageStore.loadingVerses = true
            const pageFound = pageStore.pagesList.find((p) => p.pageNumber === currentPageId.value)
            if (pageFound) {
                // reset values
                pageStore.selectedPageVerses = []
                pageStore.allVerses = []
                pageStore.selectedPage = null
                // then fetch verses
                await pageStore.getVerses(pageFound.pageNumber).then(() => {
                    if (pageStore.allVerses.length) {
                        pageStore.selectedPage = pageFound
                        pageStore.allVerses?.slice(0, perPage.value)
                            .forEach((v) => pageStore.selectedPageVerses.push({ ...v, bookmarked: false }))
                        pageStore.loadingVerses = false
                    }
                })
                if (audioStore.audioPlayerSetting.loopAudio === "repeat") {
                    if (pageStore.selectedPageVerses.length && audioStore.isPaused) {
                        await audioStore.resumeAudio().then(() => {
                            pageStore.loadingVerses = false
                        })
                    }
                }

            }
        }
    }
})

const groupVersesByChapter = computed(() => {
    return pageStore.selectedPageVerses.reduce((i: GroupVersesByChapterID, o) => {
        (i[o.chapter_id] = i[o.chapter_id] || []).push(o);
        return i;
    }, {})
})

const getSurahInfo = async (ev: number) => {
    await getchapterInfo(ev).then((response) => {
        chapterInfo.value = response.data.chapter_info
    })
    chapterInfoButtonRef.value.$el.click()
}

const getTranslationAlert = async () => {
    if (selectedTranslation.value) {
        await presentAlert({
            header: selectedTranslation.value.language_name,
            message: selectedTranslation.value.author_name,
            id: "translation-alert",
            buttons: ['Ok']
        })
    }
}

onMounted(() => {
    setPageTitle(getLine("metaPage.view"))
    pageRefEl.value = pageRef.value.$el
})

/**
 * if it's not the last verse of chapter 
 * go lto next page 
 * otherwise audio store will handle page change 
 * if the chapter audio is ended in playback ended listener 
 */
watch(lastIntersectingVerseOfPage, async (v) => {
    if (v) {
        const totalRecords = await getTotalVersesOfChapter(v.chapterId.toString())
        if (totalRecords?.total_records === v.verseNumber) {
            return
        } else {
            if (audioStore.audioPlayerSetting.loopAudio === "repeat") {
                if (currentPageId.value) {
                    currentPageId.value = currentPageId.value + 1
                    await audioStore.pauseAudio().then(() => {
                        // go to next page only if on repeat mode
                        router.push({ path: `/page/${currentPageId.value}`, replace: true })

                    })
                }
            } else {
                await audioStore.pauseAudio().then(() => {
                    audioStore.softClosePlayer()
                })
            }
        }
    }
})

/**
 * 
 * @param ev 
 * take care of play/pause or new audio play
 * for audioStore
 */
const playAudio = (ev: PlayAudioEmit) => {
    if (ev.audioID === audioStore.chapterId) {
        audioStore.handlePlay(true)
    } else {
        audioStore.handlePlay({ ...ev, audioSrc: "page" })
    }
}

/**
 * back to main pages page 
 */
watch(currentSegment, (s) => {
    if (s === "home") {
        router.replace({ path: "/pages" })
    }
})

/** 
 * for route params changes
 */
watch(() => route.params.pageId, (id) => {
    if (id) {
        if (Number(id) === currentPageId.value) {
            return
        } else {
            currentPageId.value = Number(id)
        }
    }
}, { immediate: true })

/**
 * works only if App is back focused or got active again
 * as data fetching will stop work when App is in background 
 * or broswer tab has been changed
 * @param ev 
 * this will cause no linear routing 
 * 
 */
const isAppActive = (ev: boolean) => {
    if (ev) {
        if (audioStore.audioPlayerSetting.loopAudio === "repeat") {
            router.push({ path: `/page/${currentPageId.value}`, replace: true })
        }
    }
}
</script>


<template>
    <ion-page :data-page-id="currentPageId" ref="pageRef" :key="currentPageId">
        <segments-component :selected-segment="currentSegment"
            @update:selected-segment="currentSegment = $event"></segments-component>
        <ion-content>
            <translations-view-component :id="`pages-${currentPageId}-translations`"
                :key="`pages-${currentPageId}-translations`" :is-loading="pageStore.isLoading"
                :is-playing="audioStore.isPlaying" v-if="currentSegment === 'translations'"
                @update:play-audio="playAudio" :is-bismillah="selectedChapterBismillah" :styles="computedCSS"
                :verses-group="groupVersesByChapter" :selected-verses-length="pageStore.selectedPageVerses.length"
                :chapter-name="selectedChapterName.nameArabic" :audio-experience="audioStore.audioPlayerSetting"
                @update:modal-value="getTranslationAlert" :pagination="pagination"
                :is-audio-loading="audioStore.isLoading" :download-progress="downloadFileProgress"
                :active-audio-id="audioStore.chapterId" :per-page="perPage" :page-id="pageStore.selectedPageId"
                :selected-translation-id="selectedTranslationId" :first-verse-of-verses="isFirstVerseOfVerses"
                @update:last-verse-reached-of-page="lastIntersectingVerseOfPage = $event"
                @update:active-state="isAppActive" @update:loading-verses="pageStore.loadingVerses = $event"
                :verse-count="pageStore.versesTotalRecords">
            </translations-view-component>
            <reading-view-component :id="`pages-reading-${currentPageId}`" v-else :is-playing="audioStore.isPlaying"
                :key="`pages-reading-${currentPageId}`" :verses-group="groupVersesByChapter"
                @update:play-audio="playAudio" @update:surah-info="getSurahInfo" :is-loading="pageStore.isLoading"
                :styles="computedCSS" :download-progress="downloadFileProgress"
                :audio-experience="audioStore.audioPlayerSetting" :is-audio-loading="audioStore.isLoading"
                :pagination="pagination" :active-audio-id="audioStore.audioFiles?.chapter_id"
                :verse-count="pageStore.versesTotalRecords"
                :selected-verses-length="pageStore.selectedPageVerses.length">
            </reading-view-component>
            <div>
                <ion-button ref="chapterInfoButtonRef" id="page-chapter-modal" class="ion-hide"></ion-button>
                <chapter-info-modal-component trigger="page-chapter-modal" :chapter-info="chapterInfo"
                    :page-el="pageRefEl"></chapter-info-modal-component>
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