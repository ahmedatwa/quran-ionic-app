<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted } from 'vue';
import { IonContent, IonHeader, IonSegmentButton, IonButton } from '@ionic/vue';
import { IonToolbar, IonSegment, IonLabel, IonPage } from '@ionic/vue';
// components
import TranslationsViewComponent from '@/components/chapter/TranslationsViewComponent.vue';
import ReadingViewComponent from '@/components/chapter/ReadingViewComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import ChapterInfoModalComponent from '@/components/chapter/ChapterInfoModalComponent.vue';
import { useRoute } from 'vue-router';
// stores
import { useChapterStore } from "@/stores/ChapterStore"
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";
import { useTranslationsStore } from '@/stores/TranslationsStore';
// utils
import { useLocale } from '@/utils/useLocale';
import { useSettings } from '@/utils/useSettings';
import { useAlert } from '@/utils/useAlert';
// types
import type { ChapterInfo } from '@/types/chapter';

const currentSegment = ref("translations")
const chapterStore = useChapterStore()
const audioPlayerStore = useAudioPlayerStore()
const { getLine } = useLocale()
const { presentAlert } = useAlert()
const transaltionStore = useTranslationsStore()
const pageRef = ref()
const pageRefEl = ref()
const settings = useSettings()
const chapterInfoModalRef = ref()
const audioModelValue = ref(false)
const pagination = computed(() => chapterStore.selectedChapter?.pagination)
const chapterInfo = ref<ChapterInfo | null>(null)
const verses = computed(() => {
    return chapterStore.selectedChapterVerses?.sort(
        (a, b) => a.verse_number - b.verse_number)
})

const handleSegmentChange = (ev: CustomEvent) => {
    currentSegment.value = ev.detail.value
}
const router = useRoute()
const { chapterId } = router.params

watchEffect(async () => {
    if (chapterId) {
        chapterStore.selectedChapter = null
        const found = chapterStore.chaptersList.find((c) => c.id === Number(chapterId))
        if (found) {
            if (!found.verses?.length) {
                await chapterStore.getVerses(found.id, true)
            } else {
                chapterStore.selectedChapter = found
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
        if (chapterStore.selectedChapter) {
            await chapterStore.getVerses(chapterStore.selectedChapter.id, true, pagination.value?.next_page)
        }
    };
}

const styles = computed(() => {
    return {
        fontFamily: `var(--font-family-${settings.styles.value.fontFamily})`,
        fontSize: `var(--font-size-${settings.styles.value.fontSize})`,
        fontWeight: `var(--font-weight-${settings.styles.value.fontWeight})`
    }
})

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


const getSurahInfo = async (ev: number) => {
    await chapterStore.getchapterInfo(ev).then((response) => {
        chapterInfo.value = response.data.chapter_info
    })
    chapterInfoModalRef.value.$el.click()
}

</script>


<template>
    <ion-page :data-chapter-id="chapterId" ref="pageRef">
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
            <translations-view-component id="translations-chapters" :is-loading="chapterStore.isLoading.verses"
                :is-playing="audioPlayerStore.isPlaying" :is-translations-view="currentSegment === 'translations'"
                @update:play-audio="playAudio" :is-bismillah="chapterStore.selectedChapterBismillah" :styles="styles"
                :verses="verses" :chapter-name="chapterStore.selectedChapterName.nameArabic"
                :verse-timing="audioPlayerStore.verseTiming" @update:get-verses="getVerses" :pagination="pagination"
                @update:modal-value="getTranslationAlert" :audio-experience="audioPlayerStore.audioPlayerSetting">
            </translations-view-component>
            <reading-view-component id="reading-chapters" :is-reading-view="currentSegment === 'reading'"
                :is-playing="audioPlayerStore.isPlaying" :verses="verses" :is-loading="chapterStore.isLoading.verses"
                :styles="styles" :verse-timing="audioPlayerStore.verseTiming" @update:get-verses="getVerses"
                @update:surah-info="getSurahInfo" :pagination="pagination" @update:play-audio="playAudio">
            </reading-view-component>
            <div>
                <ion-button ref="chapterInfoModalRef" id="chapter-modal-info" class="ion-hide"></ion-button>
                <chapter-info-modal-component trigger="chapter-modal-info" :chapter-info="chapterInfo"
                    :page-el="pageRefEl"></chapter-info-modal-component>
            </div>
        </ion-content>
        <div class="footer">
            <audio-player-component :model-value="audioModelValue" @update:model-value="audioModelValue = $event">
            </audio-player-component>
        </div>
    </ion-page>
</template>