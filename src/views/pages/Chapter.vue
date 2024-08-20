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


const router = useRoute()
const { chapterId } = router.params

watchEffect(async () => {
    if (chapterId) {
        chapterStore.selectedChapter = null
        const found = chapterStore.chaptersList.find((c) => c.id === Number(chapterId) || c.slug === chapterId)
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
    if (isPlaying.value) {
        audioPlayerStore.isPaused = true
        audioPlayerStore.isResumed = false;
        audioPlayerStore.isPlaying = false;
        return;
    }
    if (event.audioID === audioPlayerStore.chapterId) {
        audioPlayerStore.isResumed = true;
        audioPlayerStore.isPaused = false
        audioPlayerStore.isPlaying = true;
        return;
    }
    audioPlayerStore.resetValues()
    await audioPlayerStore.getAudio({ audioID: event.audioID, verseKey: event.verseKey })
    audioPlayerStore.isVisible = true
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
        color: settings.styles.value.color
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

</script>


<template>
    <ion-page :data-chapter-id="chapterId" ref="pageRef">
        <segments-component :selected-segment="currentSegment"
            @update:selected-segment="currentSegment = $event"></segments-component>
        <ion-content>
            <translations-view-component id="translations-chapters" :is-loading="chapterStore.isLoading.verses"
                :is-playing="isPlaying" :is-translations-view="currentSegment === 'translations'"
                :is-audio-loading="audioPlayerStore.isLoading" @update:play-audio="playAudio"
                :is-bismillah="chapterStore.selectedChapterBismillah" :styles="styles" :verses="verses"
                :chapter-name="chapterStore.selectedChapterName.nameArabic"
                :last-chapter-verse="chapterStore.getLastVerseNumberOfChapter"
                :verse-count="chapterStore.selectedChapter?.versesCount" :verse-timing="audioPlayerStore.verseTiming"
                @update:get-verses="getVerses" :pagination="pagination" @update:modal-value="getTranslationAlert"
                :audio-experience="audioPlayerStore.audioPlayerSetting">
            </translations-view-component>
            <reading-view-component id="reading-chapters" :is-reading-view="currentSegment === 'reading'"
                :is-playing="isPlaying" :verses="verses" :is-loading="chapterStore.isLoading.verses" :styles="styles"
                :verse-timing="audioPlayerStore.verseTiming" @update:get-verses="getVerses"
                :is-audio-loading="audioPlayerStore.isLoading" @update:surah-info="getSurahInfo"
                :pagination="pagination" @update:play-audio="playAudio"
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