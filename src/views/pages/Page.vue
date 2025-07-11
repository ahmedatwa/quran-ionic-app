<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted } from 'vue';
import { IonContent, IonPage, IonButton } from '@ionic/vue';
// components
import TranslationsViewComponent from '@/components/page/TranslationsViewComponent.vue';
import ReadingViewComponent from '@/components/page/ReadingViewComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import ChapterInfoModalComponent from '@/components/chapter/ChapterInfoModalComponent.vue';
import SegmentsComponent from '@/components/common/SegmentsComponent.vue';

import { useRoute } from 'vue-router';
// stores
import { usePageStore } from "@/stores/PageStore"
import { useAudioStore } from "@/stores/AudioStore";
import { useTranslationsStore } from '@/stores/TranslationsStore';
import { useChapterStore } from '@/stores/ChapterStore';
// utils
import { useSettings } from '@/utils/useSettings';
import { useAlert } from '@/utils/useAlert';
// types
import type { GroupVersesByChapterID } from "@/types/page"
import type { ChapterInfo } from '@/types/chapter';

const currentSegment = ref("translations")
const pageStore = usePageStore()
const { presentAlert } = useAlert()
const settings = useSettings()
const transaltionStore = useTranslationsStore()
const { selectedChapterName, selectedChapterBismillah, getchapterInfo } = useChapterStore()
const audioStore = useAudioStore()
const audioModelValue = ref(false)

const pagination = computed(() => pageStore.selectedPage?.pagination)
const pageRef = ref()
const pageRefEl = ref()
const chapterInfo = ref<ChapterInfo | null>(null)
const chapterInfoButtonRef = ref()
const router = useRoute()
const pageParam = computed(() => router.params.pageId ? router.params.pageId.toString().split("-"): '')
const pageId = computed(() => Number(pageParam.value[0]))
const vNumber = computed(() => Number(pageParam.value[1]))

watchEffect(async () => {
    if (pageId.value) {
        pageStore.selectedPage = null
        const found = pageStore.pagesList.find((p) => p.pageNumber === pageId.value)
        if (found) {
            if (!found.verses?.length) {
                await pageStore.getVerses(found.pageNumber, true)
            } else {
                pageStore.selectedPage = found
            }

        }
    }
})

const playAudio = async (event: { audioID: number, verseKey?: string }) => {    
    if (event.audioID === audioStore.chapterId) {
        await audioStore.handlePlay(true);
        return;
    }
    audioStore.resetValues()
    await audioStore.getAudio({ audioID: event.audioID, verseKey: event.verseKey })
}

const getVerses = async (ev: { key: string, nextPage: number }) => {
    if (ev.nextPage) {
        if (pageStore.selectedPage) {
            await pageStore.getVerses(pageStore.selectedPage?.pageNumber, true, pagination.value?.next_page)

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

const selectedVerses = computed(() => {
    if (pageStore.selectedPage) {
        return pageStore.selectedPage.verses
    }
})

const groupVersesByChapter = computed(() => {
    if (selectedVerses.value) {
        return selectedVerses.value?.reduce((i: GroupVersesByChapterID, o) => {
            (i[o.chapter_id] = i[o.chapter_id] || []).push(o);
            return i;
        }, {});
    }
})
const getSurahInfo = async (ev: number) => {
    await getchapterInfo(ev).then((response) => {
        chapterInfo.value = response.data.chapter_info
    })
    chapterInfoButtonRef.value.$el.click()
}

const getTranslationAlert = async () => {
    if (transaltionStore.selectedTranslation) {
        await presentAlert({
            header: transaltionStore.selectedTranslation?.language_name,
            message: transaltionStore.selectedTranslation.author_name,
            id: "translation-alert",
            buttons: ['Ok']
        })
    }
}

onMounted(() => pageRefEl.value = pageRef.value.$el)

</script>


<template>
    <ion-page :data-page-id="router.params.pageId" ref="pageRef">
        <segments-component :selected-segment="currentSegment"
            @update:selected-segment="currentSegment = $event"></segments-component>
        <ion-content>
            <translations-view-component :id="`translations-pages-${router.params.pageId}`" :is-loading="pageStore.isLoading"
                :is-playing="audioStore.isPlaying" v-if="currentSegment === 'translations'"
                @update:play-audio="playAudio" :is-bismillah="selectedChapterBismillah" :styles="styles"
                :verses="groupVersesByChapter" :chapter-name="selectedChapterName.nameArabic"
                :audio-experience="audioStore.audioPlayerSetting" @update:modal-value="getTranslationAlert"
                :verse-timing="audioStore.verseTiming" @update:get-verses="getVerses" :pagination="pagination"
                :is-audio-loading="audioStore.isLoading" :download-progress="audioStore.downloadProgress"
                :active-audio-id="audioStore.audioFiles?.chapter_id" :bookmarked-verse="vNumber">
            </translations-view-component>
            <reading-view-component id="reading-pages" v-else :is-playing="audioStore.isPlaying"
                :verses="groupVersesByChapter" @update:play-audio="playAudio" @update:surah-info="getSurahInfo"
                :is-loading="pageStore.isLoading" :styles="styles" :download-progress="audioStore.downloadProgress"
                :audio-experience="audioStore.audioPlayerSetting" :is-audio-loading="audioStore.isLoading"
                :verse-timing="audioStore.verseTiming" @update:get-verses="getVerses" :pagination="pagination"
                :active-audio-id="audioStore.audioFiles?.chapter_id">
            </reading-view-component>
            <div>
                <ion-button ref="chapterInfoButtonRef" id="page-chapter-modal" class="ion-hide"></ion-button>
                <chapter-info-modal-component trigger="page-chapter-modal" :chapter-info="chapterInfo"
                    :page-el="pageRefEl"></chapter-info-modal-component>
            </div>
        </ion-content>
        <div class="footer">
            <audio-player-component :model-value="audioStore.isVisible"
                @update:model-value="audioStore.isVisible = $event">
            </audio-player-component>
        </div>
    </ion-page>
</template>