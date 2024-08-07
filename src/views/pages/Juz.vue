<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted } from 'vue';
import { IonContent, IonHeader, IonSegmentButton, IonButton } from '@ionic/vue';
import { IonToolbar, IonSegment, IonLabel, IonPage } from '@ionic/vue';
// components
import TranslationsViewComponent from '@/components/juz/TranslationsViewComponent.vue';
import ReadingViewComponent from '@/components/juz/ReadingViewComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import ChapterInfoModalComponent from '@/components/chapter/ChapterInfoModalComponent.vue';
import ModalInfoComponent from '@/components/common/ModalInfoComponent.vue';
import { useRoute } from 'vue-router';
// stores
import { useJuzStore } from "@/stores/JuzStore"
import { useTranslationsStore } from '@/stores/TranslationsStore';
import { useChapterStore } from '@/stores/ChapterStore';
import { useSettingStore } from '@/stores/SettingStore';
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";
// types
import type { ChapterInfo } from '@/types/chapter';
import { useLocale } from '@/utils/useLocale';

const currentSegment = ref("translations")
const { getLine } = useLocale()
const juzStore = useJuzStore()
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
const pagination = computed(() => juzStore.selectedJuz?.pagination)

const audioModelValue = ref(false)
const pageRef = ref()
const pageRefEl = ref()
const modelInfoRef = ref()
const chapterInfo = ref<ChapterInfo | null>(null)
const modalButtonRef = ref()
const handleSegmentChange = (ev: CustomEvent) => {
    currentSegment.value = ev.detail.value
}

const router = useRoute()
const { juzId } = router.params

watchEffect(async () => {
    if (juzId) {
        juzStore.selectedJuz = null
        const found = juzStore.juzList.find((j) => j.juz_number === Number(juzId))
        if (found) {
            if (!found.verses?.length) {
                await juzStore.getVerses(found.id, true)
            } else {
                juzStore.selectedJuz = found
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
        if (juzStore.selectedJuz) {
            await juzStore.getVerses(juzStore.selectedJuz?.juz_number, true, pagination.value?.next_page)
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
    <ion-page :data-juz-id="juzId" ref="pageRef">
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
            <translations-view-component id="translations-juzs" :is-loading="juzStore.isLoading"
                :is-playing="audioPlayerStore.isPlaying" @update:modal-value="openModal"
                :is-translations-view="currentSegment === 'translations'" @update:play-audio="playAudio"
                :is-bismillah="selectedChapterBismillah" :styles="styles" :verses="juzStore.juzVersesByChapterMap"
                :chapter-name="selectedChapterName.nameArabic" :verse-timing="audioPlayerStore.verseTiming"
                @update:get-verses="getVerses" :pagination="pagination">
            </translations-view-component>
            <reading-view-component id="reading-juzs" :is-reading-view="currentSegment === 'reading'"
                :is-playing="audioPlayerStore.isPlaying" :verses="juzStore.juzVersesByChapterMap"
                :is-loading="juzStore.isLoading" :styles="styles" :verse-timing="audioPlayerStore.verseTiming"
                :pagination="pagination" @update:get-verses="getVerses" @update:surah-info="getSurahInfo">
            </reading-view-component>
            <div>
                <ion-button ref="modalButtonRef" id="juz-chapter-info" class="ion-hide"></ion-button>
                <chapter-info-modal-component trigger="juz-chapter-info" :chapter-info="chapterInfo"
                    :page-el="pageRefEl"></chapter-info-modal-component>
            </div>
            <div>
                <ion-button ref="modalButtonRefInfo" id="juz-chapter-modal" class="ion-hide"></ion-button>
                <chapter-info-modal-component trigger="juz-chapter-modal" :chapter-info="chapterInfo"
                    :page-el="pageRefEl"></chapter-info-modal-component>

                <ion-button id="juz-translation-info" ref="modelInfoRef" class="ion-hide"></ion-button>
                <modal-info-component trigger="juz-translation-info" :text="translators"></modal-info-component>
            </div>
        </ion-content>
        <audio-player-component :model-value="audioModelValue" @update:model-value="audioModelValue = $event">
        </audio-player-component>

    </ion-page>
</template>