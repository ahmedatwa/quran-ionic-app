<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted, shallowRef } from 'vue';
import { IonContent, IonButton, IonPage } from '@ionic/vue';
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
import { storeToRefs } from 'pinia';

const currentSegment = ref("translations")
const chapterStore = useChapterStore()
const audioStore = useAudioStore()
const recitionsStore = useRecitionsStore()
const { selectedTranslationId, selectedTranslation } = storeToRefs(useTranslationsStore())
const { juzList } = useJuzStore()
const { downloadFileProgress } = useAudioFile()

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
        if (computedVerses.value) {
            chapterStore.isLoading.verses = true
            currentPageEnd.value = Math.ceil(computedVerses.value?.length + perPage.value)
            const verses = chapterStore.verses?.slice(computedVerses.value?.length, currentPageEnd.value)
            if (verses) {
                verses.forEach((v) => chapterStore.selectedChapter?.verses?.push({ ...v, bookmarked: false }))
                setTimeout(() => {
                    infiniteScrollEvent.target.complete()
                    chapterStore.isLoading.verses = false
                }, 200);
            }
        }
    }
}

onMounted(() => pageRefEl.value = pageRef.value.$el)

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
            <translations-view-component id="translations-chapters" :key="chapterId"
                :is-loading="chapterStore.isLoading.verses" :is-playing="isPlaying"
                v-if="currentSegment === 'translations'" :chapter-id="chapterId"
                :download-progress="downloadFileProgress" :is-audio-loading="audioStore.isLoading"
                @update:play-audio="playAudio" :is-bismillah="chapterStore.selectedChapterBismillah"
                :styles="computedCSS" :last-chapter-verse="chapterStore.getLastVerseNumberOfChapter" :per-page="perPage"
                :verse-count="chapterStore.versesTotalRecords" @update:get-verses="loadMoreVerses"
                :pagination="pagination" :verses="computedVerses" @update:search-value="searchValue = $event"
                :chapter-name="chapterStore.selectedChapterName.nameArabic"
                @update:selected-translation="selectedTranslation = $event"
                :audio-experience="audioStore.audioPlayerSetting" :selected-translation-id="selectedTranslationId">
            </translations-view-component>
            <reading-view-component id="reading-chapters" v-else :is-playing="isPlaying" :verses="computedVerses"
                :is-loading="chapterStore.isLoading.verses" :styles="computedCSS" :chapter-id="chapterId"
                @update:get-verses="loadMoreVerses" :is-audio-loading="audioStore.isLoading" :per-page="perPage"
                @update:surah-info="getSurahInfo" :pagination="pagination" @update:play-audio="playAudio"
                :download-progress="downloadFileProgress" :audio-experience="audioStore.audioPlayerSetting"
                :verse-count="chapterStore.versesTotalRecords">
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