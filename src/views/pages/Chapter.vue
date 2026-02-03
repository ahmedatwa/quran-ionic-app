<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted, watch, shallowRef, provide } from 'vue';
import { IonContent, IonPage, IonFooter, modalController } from '@ionic/vue';
import { storeToRefs } from 'pinia';
// components
import ChapterCardViewComponent from '@/components/chapter/ChapterCardViewComponent.vue';
import ChapterInfoModalComponent from '@/components/chapter/ChapterInfoModalComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";
import ChaptersSidebar from '@/components/chapter/ChaptersSidebar.vue';

// Route
import { useRoute, useRouter } from 'vue-router';
// stores
import { useChapterStore } from "@/stores/ChapterStore"
import { useAudioStore } from "@/stores/AudioStore";
import { useTranslationsStore } from '@/stores/TranslationsStore';
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useJuzStore } from '@/stores/JuzStore';
import { useSettingsStore } from '@/stores/SettingsStore';
// composables
import { useAudioFile } from '@/composables/useAudioFile';
import { useMetaData } from '@/composables/useMetaData';
import { useLocale } from '@/composables/useLocale';
import { useAlert } from '@/composables/useAlert';
import { useStartup } from '@/composables/useStartup';
// types
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { Verse } from '@/types/verse';
import { SidebarMenuKey } from "@/types/symbols"

const currentSegment = shallowRef<"translation" | "reading">("translation")
const activeSegment = computed(() => currentSegment.value)
const chapterStore = useChapterStore()
const audioStore = useAudioStore()
const { presentLoading, dismissLoading } = useAlert()
const recitionsStore = useRecitionsStore()
const { getLine } = useLocale()
const { setMetaData, setPageTitle } = useMetaData()
const { selectedTranslationId, selectedTranslation } = storeToRefs(useTranslationsStore())
const { juzList } = storeToRefs(useJuzStore())
const { downloadFileProgress } = useAudioFile()
const pageRef = ref()
const pageRefEl = ref()
const { computedTranslationCSS, computedQuranCSS } = storeToRefs(useSettingsStore())
const route = useRoute()
const router = useRouter()
const currentChapterId = shallowRef<number>()
const { appState } = useStartup()

const computedVerses = computed(() =>
    chapterStore.selectedChapterVerses.filter((f) =>
        f.verse_number.toString().includes(chapterStore.searchVerseNumberValue)
    ))

/**
 * listen to url changes 
 * so respected verses could be fetched and stored
 */
watchEffect(async () => {
    if (route.params.chapterId) {
        currentChapterId.value = Number(route.params.chapterId)
        if (chapterStore.chaptersList.length === chapterStore.totalChapters) {
            await presentLoading({ id: `loading-chapter-${currentChapterId.value}-verses` })
            const isChapterFound = chapterStore.chaptersList.find(({ id }) => id === currentChapterId.value)
            if (isChapterFound) {
                await chapterStore.getVerses(isChapterFound.id).then(() => {
                    if (chapterStore.allVerses?.length) {
                        chapterStore.selectedChapter = null
                        chapterStore.selectedChapterVerses = []
                        chapterStore.allVerses?.slice(0, chapterStore.perPage).forEach((v) => chapterStore.selectedChapterVerses?.push({ ...v, bookmarked: false }))
                    }
                }).finally(async () => {
                    chapterStore.selectedChapter = isChapterFound
                    chapterStore.versesTotalRecords = isChapterFound.versesCount
                    // dismiss loading
                    if (chapterStore.selectedChapterVerses.length) {
                        await dismissLoading(`loading-chapter-${currentChapterId.value}-verses`)
                    }
                })

            }
        }
    }
})

const loadMoreVerses = async (event: InfiniteScrollCustomEvent) => {
    if (chapterStore.selectedChapterVerses.length === chapterStore.versesTotalRecords) {
        setTimeout(() => {
            event.target.complete();
        }, 300);
        return;
    } else {
        chapterStore.infiniteScrollMoreVerses()
        setTimeout(() => event.target.complete(), 300);
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
    // check for segments
    const segment = localStorage.getItem("chapters-segment") as typeof currentSegment.value
    if (segment) {
        currentSegment.value = segment
    }
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


/**
 * auto fetch verses 
 * every 20s 
 */
watchEffect(() => {
    if (audioStore.isPlayingState) {
        if (chapterStore.selectedChapterVerses?.length !== chapterStore.versesTotalRecords) {
            const intervalId = setInterval(() => {

                if (chapterStore.selectedChapterVerses) {
                    const start = chapterStore.selectedChapterVerses.length
                    const end = Math.ceil(chapterStore.perPage + chapterStore.selectedChapterVerses.length)
                    chapterStore.allVerses.slice(start, end).forEach((v: Verse) => {
                        // check if verse already fetched 
                        const isVerseFound = chapterStore.selectedChapterVerses.find((vs) => vs.verse_number === v.verse_number)
                        if (!isVerseFound) {
                            chapterStore.selectedChapterVerses.push({
                                ...v,
                                bookmarked: false,
                            })
                        }
                    }
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

/** 
 * for route params changes
 */
watch(() => route.params.chapterId, (id) => {
    if (id) {
        if (Number(id) === currentChapterId.value) {
            return
        } else {
            currentChapterId.value = Number(id)
        }
    }
}, { immediate: true })

const handleSelectedSegment = (event: "translation" | "reading") => {
    currentSegment.value = event
    localStorage.setItem("chapters-segment", currentSegment.value)
}

/**
 * listen to audio Id Changes
 * change the url accordingly 
 */

watch(() => audioStore.chapterId, (newID) => {
    if (appState) {
        if (currentChapterId.value !== newID) {
            router.replace({ path: `/chapter/${newID}` })
        }
    }
})



const isSidebarMenuOpen = ref(false)
const setOpen = (value: boolean) => isSidebarMenuOpen.value = value

provide(SidebarMenuKey, {
    isOpen: isSidebarMenuOpen,
    menuId: "chapters",
    setOpen
})


</script>
<template>
    <div>
        <chapters-sidebar menu-id="chapters-menu" content-id="chapters-content"></chapters-sidebar>
        <ion-page :data-chapter-id="chapterStore.selectedChapterId" ref="pageRef"
            :key="`chapter-${chapterStore.selectedChapterId}`" id="chapters-main-content">
            <toolbar-component :route-back-label="getLine('tabs.chapters')" route-back-path="/chapters"
                :chapter-id="chapterStore.selectedChapterId" :selected-segment="activeSegment" id="chapters"
                :is-loading="chapterStore.loadingVerses" @update:selected-segment="handleSelectedSegment"
                :chapter-name="chapterStore.selectedChapterName" menu-id="chapters-menu">
            </toolbar-component>
            <ion-content id="chapters-content">
                <chapter-card-view-component :current-segment="currentSegment"
                    :id="`chapter-view${chapterStore.selectedChapterId}`"
                    :key="`chapter-view${chapterStore.selectedChapterId}`" :is-loading="chapterStore.loadingVerses"
                    :is-playing="audioStore.isPlayingState" :chapter-id="chapterStore.selectedChapterId"
                    :download-progress="downloadFileProgress" :is-audio-loading="audioStore.isLoading"
                    :is-bismillah="chapterStore.selectedChapterBismillah" :quran-styles="computedQuranCSS"
                    :translation-styles="computedTranslationCSS"
                    :last-chapter-verse="chapterStore.getLastVerseNumberOfChapter" :per-page="chapterStore.perPage"
                    :verses-count="chapterStore.versesTotalRecords" :verses="computedVerses"
                    :audio-src="audioStore.audioPayLoadSrc" :chapter-name="chapterStore.selectedChapterName.nameArabic"
                    :audio-experience="audioStore.audioPlayerSetting" :selected-translation-id="selectedTranslationId"
                    @update:play-audio="audioStore.handlePlayAudio" @update:search-value="handleVerseNumberSearch"
                    @update:get-verses="loadMoreVerses" @update:selected-translation="selectedTranslation = $event"
                    :playback-seeked="audioStore.playbackSeekedValue"
                    @update:surah-info="getSurahInfo"></chapter-card-view-component>
            </ion-content>
            <ion-footer>
                <audio-player-component :model-value="audioStore.isVisible" trigger="chapters-audio-modal"
                    :selected-reciter="recitionsStore.selectedReciter"
                    @update:model-value="audioStore.isVisible = $event" :map-recitions="recitionsStore.mapRecitions"
                    @update:selected-reciter="recitionsStore.handleSelectedReciter($event, 'chapter')"
                    :juz-list="juzList">
                </audio-player-component>
            </ion-footer>
        </ion-page>
    </div>
</template>