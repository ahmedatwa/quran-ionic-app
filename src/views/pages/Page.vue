<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted, shallowRef, watch } from 'vue';
import { IonContent, IonPage, modalController, IonFooter } from '@ionic/vue';
import { storeToRefs } from 'pinia';
// components
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import ChapterInfoModalComponent from '@/components/chapter/ChapterInfoModalComponent.vue';
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";
import PageCardViewComponent from '@/components/page/PageCardViewComponent.vue';
import { useRoute, useRouter } from "vue-router";
// stores
import { usePageStore } from "@/stores/PageStore"
import { useAudioStore } from "@/stores/AudioStore";
import { useTranslationsStore } from '@/stores/TranslationsStore';
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useChapterStore } from '@/stores/ChapterStore';
import { useJuzStore } from '@/stores/JuzStore';
import { useSettingsStore } from '@/stores/SettingsStore';
// composables
import { useAlert } from '@/composables/useAlert';
import { useAudioFile } from '@/composables/useAudioFile';
import { useLocale } from '@/composables/useLocale';
import { useMetaData } from '@/composables/useMetaData';
// types
import type { GroupVersesByChapterID } from "@/types/page"
import type { PlayAudioEmit } from "@/types/audio";



const currentSegment = shallowRef<"translation" | "reading">("translation")
const activeSegment = computed(() => currentSegment.value)
const pageStore = usePageStore()
const { presentLoading, dismissLoading } = useAlert()
const { getLine } = useLocale()
const {  setPageTitle } = useMetaData()
const { computedQuranCSS, computedTranslationCSS } = storeToRefs(useSettingsStore())
const recitionsStore = useRecitionsStore()
const { juzList } = storeToRefs(useJuzStore())
const { selectedTranslation, selectedTranslationId } = storeToRefs(useTranslationsStore())
const { selectedChapterName, selectedChapterBismillah, getTotalVersesOfChapter } = useChapterStore()
const audioStore = useAudioStore()
const { downloadFileProgress } = useAudioFile()
const pagination = computed(() => pageStore.selectedPage?.pagination)
const pageRefEl = ref()
const route = useRoute()
const router = useRouter()
const perPage = shallowRef(30)
const lastIntersectingVerseOfPage = shallowRef<{ verseNumber: number, chapterId: number }>()
const currentPageId = shallowRef<number>()
const isFirstVerseOfVerses = computed(() => pageStore.getFirstVerseOfSeletedPage?.verse_number)
const activeMenuId = shallowRef("")

// const { activeComputedChapterId, activeComputedVerseKey } = useVerseTiming()
// const activeAudioDataToPlay = shallowRef<PlayAudioEmit>()
/** 
 * entry point for storing verses 
 * based on URL pageId param change
 */
watchEffect(async () => {
    if (route.params.pageId) {
        currentPageId.value = Number(route.params.pageId)
        await presentLoading({ id: `loading-page-${currentPageId.value}-verses` })
        const pageFound = pageStore.pagesList.find(({ pageNumber }) => pageNumber === currentPageId.value)
        if (pageFound) {
            // then fetch verses
            await pageStore.getVerses(pageFound.pageNumber).then(() => {
                if (pageStore.allVerses.length) {
                    // reset values
                    pageStore.selectedPageVerses = []
                    pageStore.selectedPage = null

                    pageStore.allVerses?.slice(0, perPage.value)
                        .forEach((v) => pageStore.selectedPageVerses.push({ ...v, bookmarked: false }))
                }
            }).finally(async () => {
                pageStore.selectedPage = pageFound
                // dismiss loading
                if (pageStore.selectedPageVerses.length) {
                    await dismissLoading(`loading-page-${currentPageId.value}-verses`)
                }
            })

            if (audioStore.audioPlayerSetting?.loopAudio === "repeat") {
                if (pageStore.selectedPageVerses.length && audioStore.isPaused) {
                    audioStore.resumeAudio().then(async () => {
                        await dismissLoading(`loading-page-${currentPageId.value}-verses`)
                    })
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

const getSurahInfo = async (id: number) => {
    const ChapterModalInfo = await modalController.create({
        component: ChapterInfoModalComponent,
        componentProps: {
            chapterId: id,
            pageEl: pageRefEl.value
        }
    });

    ChapterModalInfo.present();
}

onMounted(() => {
    setPageTitle(getLine("metaPage.view"))
    // check for segments
    const segment = localStorage.getItem("pages-segment") as typeof currentSegment.value
    if (segment) {
        currentSegment.value = segment
    }
})

/**
 * if it's not the last verse of chapter 
 * go lto next page 
 * otherwise audio store will handle page change 
 * if the chapter audio is ended in playback ended listener 
 */
watch(lastIntersectingVerseOfPage, async (v) => {
    if (v) {
        if (audioStore.audioPlayerSetting?.loopAudio === "repeat") {
            await getTotalVersesOfChapter(v.chapterId.toString()).then(async (result) => {
                if (result?.total_records === v.verseNumber) {
                    return
                } else {
                    // Playback is not ended hence move to next page
                    if (currentPageId.value) {
                        console.log(currentPageId.value);
                        currentPageId.value = currentPageId.value + 1
                        await audioStore.pauseAudio().then(() => {
                            // go to next page only if on repeat mode
                            router.replace({ path: `/page/${currentPageId.value}` })

                        })
                    }
                }
            })

        } else {
            // close player
            audioStore.closePlayer()
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
 * works only if App is back focused or got active again
 * as data fetching will stop work when App is in background 
 * or broswer tab has been changed
 * @param ev 
 * this will cause no linear routing 
 * 
 */
const isAppActive = (ev: boolean) => {
    if (ev) {
        if (audioStore.audioPlayerSetting?.loopAudio === "repeat") {
            router.push({ path: `/page/${currentPageId.value}`, replace: true })
        }
    }
}

const handleSelectedSegment = (event: "translation" | "reading") => {
    currentSegment.value = event
    localStorage.setItem("pages-segment", currentSegment.value)
}

</script>


<template>
    <ion-page :key="`page-${currentPageId}`" :id="`page-${currentPageId}`">
        <toolbar-component :route-back-label="getLine('tabs.pages')" route-back-path="/pages" :page-id="currentPageId"
            :selected-segment="activeSegment" id="chapters" @update:selected-segment="handleSelectedSegment">
        </toolbar-component>
        <ion-content>
            <page-card-view-component :currentSegment="currentSegment" :id="`pages-${currentPageId}-view`"
                :key="`pages-${currentPageId}-translations`" :is-loading="pageStore.isLoading"
                :is-playing="audioStore.isPlaying" @update:play-audio="playAudio"
                :is-bismillah="selectedChapterBismillah" :quran-styles="computedQuranCSS"
                :translation-styles="computedTranslationCSS" :verses-group="groupVersesByChapter"
                :selected-verses-length="pageStore.selectedPageVerses.length"
                :chapter-name="selectedChapterName.nameArabic" :audio-experience="audioStore.audioPlayerSetting"
                @update:selected-translation="selectedTranslation = $event" :pagination="pagination"
                :is-audio-loading="audioStore.isLoading" :download-progress="downloadFileProgress"
                :active-audio-id="audioStore.chapterId" :per-page="perPage" :page-id="pageStore.selectedPageId"
                :selected-translation-id="selectedTranslationId" :first-verse-of-verses="isFirstVerseOfVerses"
                @update:last-verse-reached-of-page="lastIntersectingVerseOfPage = $event"
                @update:active-state="isAppActive" @update:loading-verses="pageStore.loadingVerses = $event"
                :verse-count="pageStore.versesTotalRecords" @update:surah-info="getSurahInfo">
            </page-card-view-component>

        </ion-content>
        <ion-footer>
            <audio-player-component :model-value="audioStore.isVisible" trigger="pages-audio-modal"
                :selected-reciter="recitionsStore.selectedReciter" @update:model-value="audioStore.isVisible = $event"
                :map-recitions="recitionsStore.mapRecitions"
                @update:selected-reciter="recitionsStore.handleSelectedReciter($event, 'page')" :juz-list="juzList">
            </audio-player-component>
        </ion-footer>
    </ion-page>

</template>