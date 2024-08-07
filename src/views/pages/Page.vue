<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted } from 'vue';
import { IonContent, IonHeader, IonSegmentButton, IonButton } from '@ionic/vue';
import { IonToolbar, IonSegment, IonLabel, IonPage } from '@ionic/vue';
// components
import TranslationsViewComponent from '@/components/page/TranslationsViewComponent.vue';
import ReadingViewComponent from '@/components/page/ReadingViewComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import ChapterInfoModalComponent from '@/components/chapter/ChapterInfoModalComponent.vue';
import ModalInfoComponent from '@/components/common/ModalInfoComponent.vue';
import { useRoute } from 'vue-router';
// stores
import { usePageStore } from "@/stores/PageStore"
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";
import { useTranslationsStore } from '@/stores/TranslationsStore';
import { useChapterStore } from '@/stores/ChapterStore';
import { useSettingStore } from '@/stores/SettingStore';
// utils
import { useLocale } from '@/utils/useLocale';
// types
import type { GroupVersesByChapterID } from "@/types/page"
import type { ChapterInfo } from '@/types/chapter';

const currentSegment = ref("translations")
const pageStore = usePageStore()
const { getLine } = useLocale()
const { selectedTranslations } = useTranslationsStore()
const { selectedChapterName, selectedChapterBismillah, getchapterInfo } = useChapterStore()
const { cssVars } = useSettingStore()
const audioPlayerStore = useAudioPlayerStore()
const translators = computed(() => selectedTranslations.map((t) => {
    return {
        title: t.language_name,
        body: t.name
    }
}))
const audioModelValue = ref(false)
const handleSegmentChange = (ev: CustomEvent) => {
    currentSegment.value = ev.detail.value
}

const pagination = computed(() => pageStore.selectedPage?.pagination)
const pageRef = ref()
const pageRefEl = ref()
const modelInfoRef = ref()
const chapterInfo = ref<ChapterInfo | null>(null)
const modalButtonRef = ref()
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
    await audioPlayerStore.getAudio({ audioID: event.audioID, verseKey: event.verseKey })
    audioModelValue.value = true
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
        fontFamily: `var(--font-family-${cssVars.quranFontFamily})`,
        fontSize: `var(--font-size-${cssVars.quranFrontSize})`,
        fontWeight: `var(--font-weight-${cssVars.fontWeight})`
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
    modalButtonRef.value.$el.click()
}

const openModal = () => {
    modelInfoRef.value.$el.click()
}
onMounted(() => pageRefEl.value = pageRef.value.$el)


</script>


<template>
    <ion-page :data-page-id="pageId" ref="pageRef">
        <ion-header>
            <ion-toolbar>
                <ion-segment :value="currentSegment" @ion-change="handleSegmentChange">
                    <ion-segment-button value="translations">
                        <ion-label>{{ getLine('tabs.translations') }}</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="reading">
                        <ion-label>{{ getLine('tabs.reading') }}</ion-label>
                    </ion-segment-button>
                </ion-segment>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <translations-view-component id="translations-pages" :is-loading="pageStore.isLoading"
                :is-playing="audioPlayerStore.isPlaying" :is-translations-view="currentSegment === 'translations'"
                @update:play-audio="playAudio" :is-bismillah="selectedChapterBismillah" :styles="styles"
                :verses="groupVersesByChapter" :chapter-name="selectedChapterName.nameArabic"
                @update:modal-value="openModal" :verse-timing="audioPlayerStore.verseTiming"
                @update:get-verses="getVerses" :pagination="pagination">
            </translations-view-component>
            <reading-view-component id="reading-pages" :is-reading-view="currentSegment === 'reading'"
                :is-playing="audioPlayerStore.isPlaying" :verses="groupVersesByChapter"
                @update:surah-info="getSurahInfo" :is-loading="pageStore.isLoading" :styles="styles"
                :verse-timing="audioPlayerStore.verseTiming" @update:get-verses="getVerses" :pagination="pagination">
            </reading-view-component>
            <div>
                <ion-button ref="modalButtonRefInfo" id="page-chapter-modal" class="ion-hide"></ion-button>
                <chapter-info-modal-component trigger="page-chapter-modal" :chapter-info="chapterInfo"
                    :page-el="pageRefEl"></chapter-info-modal-component>

                <ion-button id="page-modal-info" ref="modelInfoRef" class="ion-hide"></ion-button>
                <modal-info-component trigger="page-modal-info" :text="translators"></modal-info-component>
            </div>
        </ion-content>
        <audio-player-component :model-value="audioModelValue" @update:model-value="audioModelValue = $event">
        </audio-player-component>
    </ion-page>
</template>