<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted } from 'vue';
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

// types
import type { ChapterInfo } from '@/types/chapter';
import type { InfiniteScrollCustomEvent } from "@ionic/vue"


const currentSegment = ref("translations")
const chapterStore = useChapterStore()
const audioStore = useAudioStore()
const recitionsStore = useRecitionsStore()
const { selectedTranslationId, selectedTranslation } = storeToRefs(useTranslationsStore())
const { juzList } = storeToRefs(useJuzStore())
const { downloadFileProgress } = useAudioFile()
const pageRef = ref()
const pageRefEl = ref()
const chapterInfoModalRef = ref()
const { computedCSS } = useSettings()
const chapterInfo = ref<ChapterInfo | null>(null)
const pagination = computed(() => chapterStore.selectedChapter?.pagination)
const { params } = useRoute()
const chapterId = computed(() => Number(params.chapterId))


// verses
/**
 * listen to url changes 
 * so respected verses could be fetched and stored
 */
watchEffect(async () => {
    if (chapterId.value !== chapterStore.selectedChapter?.id) {
        chapterStore.selectedChapter = null
        const chapterIsFound = chapterStore.validateSelectedChapterVerses(chapterId.value)
        if (chapterIsFound) {
            if (!chapterIsFound.isValidVerseLength) {
                await chapterStore.getVerses(chapterId.value)
                if (chapterStore.verses?.length) {
                    const verses = chapterStore.verses?.slice(0, chapterStore.perPage)
                    if (verses) {
                        chapterStore.selectedChapter = chapterIsFound.chapterData
                        verses.forEach((v) => chapterStore.selectedChapter?.verses?.push({ ...v, bookmarked: false }))
                    }
                }
            } else {
                chapterStore.selectedChapter = chapterIsFound.chapterData
            }
        }
    }
})

const loadMoreVerses = async (infiniteScrollEvent: InfiniteScrollCustomEvent) => {
    if (chapterStore.computedVerses?.length === chapterStore.versesTotalRecords) {
        infiniteScrollEvent.target.complete()
    } else {
        await chapterStore.fetchMoreVerses(infiniteScrollEvent)
    }
}

onMounted(() => {
    pageRefEl.value = pageRef.value.$el
    // if (!chapterStore.verses.length)
})

const getSurahInfo = async (ev: number) => {
    await chapterStore.getchapterInfo(ev).then((response) => {
        chapterInfo.value = response.data.chapter_info
    })
    chapterInfoModalRef.value.$el.click()
}

</script>
<template>
    <ion-page :data-chapter-id="chapterId" ref="pageRef">
        <segments-component :selected-segment="currentSegment"
            @update:selected-segment="currentSegment = $event"></segments-component>
        <ion-content>
            <translations-view-component v-if="currentSegment === 'translations'" id="translations-chapters"
                :key="`translations-${chapterId}`" :is-loading="chapterStore.loadingVerses"
                :is-playing="audioStore.isPlayingState" :chapter-id="chapterId"
                :download-progress="downloadFileProgress" :is-audio-loading="audioStore.isLoading"
                @update:play-audio="audioStore.handlePlayAudio" :is-bismillah="chapterStore.selectedChapterBismillah"
                :styles="computedCSS" :last-chapter-verse="chapterStore.getLastVerseNumberOfChapter"
                :per-page="chapterStore.perPage" :verse-count="chapterStore.versesTotalRecords"
                @update:get-verses="loadMoreVerses" :pagination="pagination" :verses="chapterStore.computedVerses"
                @update:search-value="chapterStore.searchValue = $event"
                :chapter-name="chapterStore.selectedChapterName.nameArabic"
                @update:selected-translation="selectedTranslation = $event"
                :audio-experience="audioStore.audioPlayerSetting" :selected-translation-id="selectedTranslationId"
                @update:loading-verses="chapterStore.loadingVerses = $event"
                :playback-seeked="audioStore.playbackSeekedValue">
            </translations-view-component>
            <reading-view-component v-else id="reading-chapters" :key="`reading-${chapterId}`"
                :is-loading="chapterStore.loadingVerses" :is-playing="audioStore.isPlayingState" :chapter-id="chapterId"
                :download-progress="downloadFileProgress" :is-audio-loading="audioStore.isLoading"
                @update:play-audio="audioStore.handlePlayAudio" :is-bismillah="chapterStore.selectedChapterBismillah"
                :styles="computedCSS" :last-chapter-verse="chapterStore.getLastVerseNumberOfChapter"
                :per-page="chapterStore.perPage" :verse-count="chapterStore.versesTotalRecords"
                @update:get-verses="loadMoreVerses" :pagination="pagination" :verses="chapterStore.computedVerses"
                @update:search-value="chapterStore.searchValue = $event"
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