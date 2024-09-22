<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted } from 'vue';
import { IonContent, IonButton, IonPage } from '@ionic/vue';
// components
import TranslationsViewComponent from '@/components/chapter/TranslationsViewComponent.vue';
import ReadingViewComponent from '@/components/chapter/ReadingViewComponent.vue';
import ChapterInfoModalComponent from '@/components/chapter/ChapterInfoModalComponent.vue';
import SegmentsComponent from '@/components/common/SegmentsComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";

import { useRoute } from 'vue-router';
// stores
import { useChapterStore } from "@/stores/ChapterStore"
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";
import { useTranslationsStore } from '@/stores/TranslationsStore';
// utils
import { useSettings } from '@/utils/useSettings';
import { useAlert } from '@/utils/useAlert';
import { makeVerseKey } from '@/utils/verse';
// types
import type { ChapterInfo } from '@/types/chapter';

const currentSegment = ref("translations")
const chapterStore = useChapterStore()
const audioPlayerStore = useAudioPlayerStore()
const { presentAlert } = useAlert()
const transaltionStore = useTranslationsStore()
const pageRef = ref()
const pageRefEl = ref()
const settings = useSettings()
const chapterInfoModalRef = ref()
const pagination = computed(() => chapterStore.selectedChapter?.pagination)
const chapterInfo = ref<ChapterInfo | null>(null)
const verses = computed(() => {
    return chapterStore.selectedChapterVerses?.sort(
        (a, b) => a.verse_number - b.verse_number)
})


const { params } = useRoute()
const chapterId = computed(() => Number(params.chapterId))
const chapterSlug = computed(() => params.slug)

watchEffect(async () => {
    if (chapterId) {
        chapterStore.selectedChapter = null
        const found = chapterStore.chaptersList.find((c) => c.id === Number(chapterId) || c.slug === chapterSlug.value)
        if (found) {
            if (!found.verses?.length) {
                await chapterStore.getVerses(found.id, true)
            } else {
                chapterStore.selectedChapter = found
            }

        }
    }
})

const isPlaying = computed(() => audioPlayerStore.isPlaying
    && audioPlayerStore.chapterId === chapterStore.selectedChapter?.id)

const playAudio = async (event: { audioID: number, verseKey?: string }) => {
    if (event.audioID === audioPlayerStore.chapterId) {
        audioPlayerStore.handlePlay();
        return;
    }
    audioPlayerStore.resetValues()
    await audioPlayerStore.getAudio({ audioID: event.audioID, verseKey: event.verseKey })
}

const getVerses = async (ev: { key: string, nextPage: number }) => {
    if (ev.nextPage) {
        if (chapterStore.selectedChapter) {
            await chapterStore.getVerses(chapterStore.selectedChapter.id, true, pagination.value?.next_page)
        }
    };
}

const styles = computed(() => {
    return {
        fontFamily: `var(--font-family-${settings.styles.value.fontFamily})`,
        fontSize: `var(--font-size-${settings.styles.value.fontSize})`,
        fontWeight: `var(--font-weight-${settings.styles.value.fontWeight})`,
        colorCode: settings.styles.value.wordColor.code
    }
})

const getTranslationAlert = async () => {
    if (transaltionStore.selectedTranslation) {
        await presentAlert({
            header: transaltionStore.selectedTranslation?.language_name,
            message: transaltionStore.selectedTranslation.author_name,
            id: "translation-alert",
        })
    }
}

onMounted(() => pageRefEl.value = pageRef.value.$el)

const getSurahInfo = async (ev: number) => {
    await chapterStore.getchapterInfo(ev).then((response) => {
        chapterInfo.value = response.data.chapter_info
    })
    chapterInfoModalRef.value.$el.click()
}

const getVerseByKey = async (verseNumber: number) => {    
    await chapterStore.getVerseByKey(chapterId.value, makeVerseKey(chapterId.value, verseNumber) )
}
</script>


<template>
    <ion-page :data-chapter-id="chapterId" ref="pageRef">
        <segments-component :selected-segment="currentSegment"
            @update:selected-segment="currentSegment = $event"></segments-component>
        <ion-content>
            <translations-view-component id="translations-chapters" :is-loading="chapterStore.isLoading.verses"
                :is-playing="isPlaying" v-if="currentSegment === 'translations'" :chapter-id="chapterId"
                :download-progress="audioPlayerStore.downloadProgress" :is-audio-loading="audioPlayerStore.isLoading"
                @update:play-audio="playAudio" :is-bismillah="chapterStore.selectedChapterBismillah" :styles="styles"
                :verses="verses" :chapter-name="chapterStore.selectedChapterName.nameArabic"
                :last-chapter-verse="chapterStore.getLastVerseNumberOfChapter"
                :verse-count="chapterStore.selectedChapter?.versesCount" :verse-timing="audioPlayerStore.verseTiming"
                @update:get-verses="getVerses" :pagination="pagination" @update:modal-value="getTranslationAlert"
                :audio-experience="audioPlayerStore.audioPlayerSetting" @update:get-verse-by-key="getVerseByKey">
            </translations-view-component>
            <reading-view-component id="reading-chapters" v-else :is-playing="isPlaying" :verses="verses"
                :is-loading="chapterStore.isLoading.verses" :styles="styles" :chapter-id="chapterId"
                :verse-timing="audioPlayerStore.verseTiming" @update:get-verses="getVerses"
                :is-audio-loading="audioPlayerStore.isLoading" @update:surah-info="getSurahInfo"
                :pagination="pagination" @update:play-audio="playAudio"
                :download-progress="audioPlayerStore.downloadProgress"
                :audio-experience="audioPlayerStore.audioPlayerSetting"
                :verse-count="chapterStore.selectedChapter?.versesCount">
            </reading-view-component>
            <div>
                <ion-button ref="chapterInfoModalRef" id="chapter-modal-info" class="ion-hide"></ion-button>
                <chapter-info-modal-component trigger="chapter-modal-info" :chapter-info="chapterInfo"
                    :page-el="pageRefEl">
                </chapter-info-modal-component>
            </div>
        </ion-content>
        <div class="footer">
            <audio-player-component :model-value="audioPlayerStore.isVisible"
                @update:model-value="audioPlayerStore.isVisible = $event">
            </audio-player-component>
        </div>
    </ion-page>
</template>