<script lang="ts" setup>
import { ref, watchEffect, computed, onMounted } from 'vue';
import { IonContent, IonPage, IonButton } from '@ionic/vue';
// components
import TranslationsViewComponent from '@/components/juz/TranslationsViewComponent.vue';
import ReadingViewComponent from '@/components/juz/ReadingViewComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import ChapterInfoModalComponent from '@/components/chapter/ChapterInfoModalComponent.vue';
import SegmentsComponent from '@/components/common/SegmentsComponent.vue';

import { useRoute } from 'vue-router';
// stores
import { useJuzStore } from "@/stores/JuzStore"
import { useTranslationsStore } from '@/stores/TranslationsStore';
import { useChapterStore } from '@/stores/ChapterStore';
import { useAudioStore } from "@/stores/AudioStore";
// types
import type { ChapterInfo } from '@/types/chapter';
// utils
import { useSettings } from '@/utils/useSettings';
import { useAlert } from '@/utils/useAlert';

const currentSegment = ref("translations")
const { presentAlert } = useAlert()
const settings = useSettings()
const juzStore = useJuzStore()
const transaltionStore = useTranslationsStore()
const { selectedChapterName, selectedChapterBismillah, getchapterInfo } = useChapterStore()
const audioStore = useAudioStore()
const pagination = computed(() => juzStore.selectedJuz?.pagination)

const audioModelValue = ref(false)
const pageRef = ref()
const pageRefEl = ref()
const chapterInfo = ref<ChapterInfo | null>(null)
const chapterInfoButtonRef = ref()
const router = useRoute()

watchEffect(async () => {    
    if (router.params.juzId) {
        juzStore.selectedJuz = null
        const found = juzStore.juzList.find((j) => j.juz_number === Number(router.params.juzId))
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
    if (event.audioID === audioStore.chapterId) {
        await audioStore.handlePlay(true);
        return;
    }
    audioStore.resetValues()
    await audioStore.getAudio({ audioID: event.audioID, verseKey: event.verseKey })
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
        fontFamily: `var(--font-family-${settings.styles.value.fontFamily})`,
        fontSize: `var(--font-size-${settings.styles.value.fontSize})`,
        fontWeight: `var(--font-weight-${settings.styles.value.fontWeight})`,
        colorCode: settings.styles.value.wordColor.code
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
    <ion-page :data-juz-id="router.params.juzId" ref="pageRef">
        <segments-component :selected-segment="currentSegment"
            @update:selected-segment="currentSegment = $event"></segments-component>
        <ion-content>
            <translations-view-component id="translations-juzs" :is-loading="juzStore.isLoading"
                :is-playing="audioStore.isPlaying" @update:modal-value="getTranslationAlert"
                v-if="currentSegment === 'translations'" @update:play-audio="playAudio"
                :download-progress="audioStore.downloadProgress" :is-bismillah="selectedChapterBismillah"
                :styles="styles" :verses="juzStore.juzVersesByChapterMap" :chapter-name="selectedChapterName.nameArabic"
                :verse-timing="audioStore.verseTiming" :audio-experience="audioStore.audioPlayerSetting"
                @update:get-verses="getVerses" :pagination="pagination" :is-audio-loading="audioStore.isLoading"
                :active-audio-id="audioStore.audioFiles?.chapter_id">
            </translations-view-component>
            <reading-view-component id="reading-juzs" v-else :is-playing="audioStore.isPlaying"
                :verses="juzStore.juzVersesByChapterMap" @update:play-audio="playAudio" :is-loading="juzStore.isLoading"
                :styles="styles" :audio-experience="audioStore.audioPlayerSetting"
                :download-progress="audioStore.downloadProgress" :verse-timing="audioStore.verseTiming"
                :pagination="pagination" @update:get-verses="getVerses" @update:surah-info="getSurahInfo"
                :is-audio-loading="audioStore.isLoading"
                :active-audio-id="audioStore.audioFiles?.chapter_id">
            </reading-view-component>
            <div>
                <ion-button ref="chapterInfoButtonRef" id="juz-chapter-modal" class="ion-hide"></ion-button>
                <chapter-info-modal-component trigger="juz-chapter-modal" :chapter-info="chapterInfo"
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