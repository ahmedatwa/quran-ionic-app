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
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";
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
const audioPlayerStore = useAudioPlayerStore()
const audioModelValue = ref(false)

const pagination = computed(() => pageStore.selectedPage?.pagination)
const pageRef = ref()
const pageRefEl = ref()
const chapterInfo = ref<ChapterInfo | null>(null)
const chapterInfoButtonRef = ref()
const router = useRoute()
const { pageId } = router.params

watchEffect(async () => {
    if (pageId) {
        pageStore.selectedPage = null
        const found = pageStore.pagesList.find((p) => p.pageNumber === Number(pageId))
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
    audioModelValue.value = true
    audioPlayerStore.resetValues()
    await audioPlayerStore.getAudio({ audioID: event.audioID, verseKey: event.verseKey })
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
    <ion-page :data-page-id="pageId" ref="pageRef">
        <segments-component :selected-segment="currentSegment"
            @update:selected-segment="currentSegment = $event"></segments-component>
        <ion-content>
            <translations-view-component id="translations-pages" :is-loading="pageStore.isLoading"
                :is-playing="audioPlayerStore.isPlaying" v-if="currentSegment === 'translations'"
                @update:play-audio="playAudio" :is-bismillah="selectedChapterBismillah" :styles="styles"
                :verses="groupVersesByChapter" :chapter-name="selectedChapterName.nameArabic"
                :audio-experience="audioPlayerStore.audioPlayerSetting" @update:modal-value="getTranslationAlert"
                :verse-timing="audioPlayerStore.verseTiming" @update:get-verses="getVerses" :pagination="pagination"
                :is-audio-loading="audioPlayerStore.isLoading" :download-progress="audioPlayerStore.downloadProgress"
                :active-audio-id="audioPlayerStore.audioFiles?.chapter_id">
            </translations-view-component>
            <reading-view-component id="reading-pages" v-else :is-playing="audioPlayerStore.isPlaying"
                :verses="groupVersesByChapter" @update:play-audio="playAudio" @update:surah-info="getSurahInfo"
                :is-loading="pageStore.isLoading" :styles="styles"
                :download-progress="audioPlayerStore.downloadProgress"
                :audio-experience="audioPlayerStore.audioPlayerSetting" :is-audio-loading="audioPlayerStore.isLoading"
                :verse-timing="audioPlayerStore.verseTiming" @update:get-verses="getVerses" :pagination="pagination"
                :active-audio-id="audioPlayerStore.audioFiles?.chapter_id">
            </reading-view-component>
            <div>
                <ion-button ref="chapterInfoButtonRef" id="page-chapter-modal" class="ion-hide"></ion-button>
                <chapter-info-modal-component trigger="page-chapter-modal" :chapter-info="chapterInfo"
                    :page-el="pageRefEl"></chapter-info-modal-component>
            </div>
        </ion-content>
        <audio-player-component :model-value="audioModelValue" @update:model-value="audioModelValue = $event">
        </audio-player-component>
    </ion-page>
</template>