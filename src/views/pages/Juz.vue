<script lang="ts" setup>
import { watchEffect, computed, onMounted, shallowRef, watch } from 'vue';
import { IonContent, IonPage, IonFooter } from '@ionic/vue';
import { storeToRefs } from "pinia"
// components
import JuzCardViewComponent from '@/components/juz/JuzCardViewComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";

import { useRoute } from 'vue-router';
// stores
import { useJuzStore } from "@/stores/JuzStore"
import { useTranslationsStore } from '@/stores/TranslationsStore';
import { useAudioStore } from "@/stores/AudioStore";
import { useChapterStore } from '@/stores/ChapterStore';
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useSettingsStore } from '@/stores/SettingsStore';

// types
import type { ChapterInfo } from '@/types/chapter';
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { Verse } from '@/types/verse';
import type { PlayAudioEmit } from '@/types/audio';
// composables
import { useAudioFile } from '@/composables/useAudioFile';
import { useAlert } from '@/composables/useAlert';
import { useLocale } from '@/composables/useLocale';

const currentSegment = shallowRef<"translation" | "reading">("translation")
const activeSegment = computed(() => currentSegment.value)
const { downloadFileProgress } = useAudioFile()
const { computedQuranCSS, computedTranslationCSS } = storeToRefs(useSettingsStore())
const { getLine } = useLocale()
const { presentLoading, dismissLoading } = useAlert()
const juzStore = useJuzStore()
const { selectedTranslation, selectedTranslationId } = storeToRefs(useTranslationsStore())
const { selectedChapterName, selectedChapterBismillah, getchapterInfo } = useChapterStore()
const recitionsStore = useRecitionsStore()
const audioStore = useAudioStore()
const pagination = computed(() => juzStore.selectedJuz?.pagination)

const juzPageRef = shallowRef()
const pageRefEl = shallowRef()
const chapterInfo = shallowRef<ChapterInfo | null>(null)
const chapterInfoButtonRef = shallowRef()

const route = useRoute()
const currentJuzId = shallowRef<number>()



watchEffect(async () => {
    if (route.params.juzId) {
        currentJuzId.value = Number(route.params.juzId)
        if (juzStore.juzList.length) {
            await presentLoading({ id: `loading-juz-${currentJuzId.value}-verses` })
            const isJuzFound = juzStore.juzList.find(({ juz_number }) => juz_number === currentJuzId.value)
            if (isJuzFound) {
                await juzStore.getVerses(isJuzFound.juz_number).then(() => {
                    if (juzStore.allVerses.length) {
                        juzStore.selectedJuzVerses = []
                        juzStore.selectedJuz = null
                        juzStore.allVerses?.slice(0, juzStore.perPage)
                            .forEach((v) => juzStore.selectedJuzVerses.push({ ...v, bookmarked: false }))
                    }
                }).finally(async () => {
                    juzStore.selectedJuz = isJuzFound
                    // dismiss loading
                    if (juzStore.selectedJuzVerses.length) {
                        await dismissLoading(`loading-juz-${currentJuzId.value}-verses`)
                    }
                })
            }
        }
    }
})

const playAudio = async (event: PlayAudioEmit) => {
    if (event.audioID === audioStore.chapterId) {
        await audioStore.handlePlay(true);
        return;
    }
    audioStore.resetValues()
    await audioStore.getAudio({ ...event })
}

/**
 * if playAllJuz in audio settings is enabled
 * @param chapterId 
 */
const playNextChapterOfJuz = async (ev: { chapterId: number, delay: number }) => {
    if (audioStore.chapterId === ev.chapterId) return;

    await Promise.all([
        presentLoading({
            id: `loading-next-juz-audio-${ev.chapterId}`,
            message: getLine("text.loadingNextChapterAudio"),
        }),
        audioStore.handlePlay({ audioID: ev.chapterId, audioSrc: "juz" })
    ])

    if (audioStore.audioReadyState === 4 && audioStore.audioCanPlayThroughState) {
        await dismissLoading(`loading-next-juz-audio-${ev.chapterId}`)
    }

}


const getSurahInfo = async (ev: number) => {
    await getchapterInfo(ev).then((response) => {
        chapterInfo.value = response.data.chapter_info
    })
    chapterInfoButtonRef.value.$el.click()
}

/**
 * auto fetch verses 
 * every 20s 
 */
watchEffect(() => {
    if (audioStore.isPlayingState) {
        if (juzStore.selectedJuzVerses?.length !== juzStore.versesTotalRecords) {
            const intervalId = setInterval(() => {
                if (juzStore.selectedJuzVerses) {
                    juzStore.allVerses.slice(juzStore.selectedJuzVerses.length, Math.ceil(juzStore.perPage + juzStore.selectedJuzVerses.length)).forEach((v: Verse) =>
                        juzStore.selectedJuzVerses.push({
                            ...v,
                            bookmarked: false,
                        })
                    );
                }
                if (juzStore.selectedJuzVerses.length === juzStore.versesTotalRecords) {
                    clearInterval(intervalId)
                }
            }, 20000)
        } else {
            return
        }
    }
})

onMounted(() => {
    pageRefEl.value = juzPageRef.value.$el
    // check for segments
    const segment = localStorage.getItem("juzs-segment") as typeof currentSegment.value
    if (segment) {
        currentSegment.value = segment
    }
})

const loadMoreVerses = async (infiniteScrollEvent: InfiniteScrollCustomEvent) => {
    if (juzStore.selectedJuzVerses?.length === juzStore.versesTotalRecords) {
        setTimeout(() => {
            infiniteScrollEvent.target.complete()
        }, 200);
    } else {
        await juzStore.fetchMoreJuzVerses(infiniteScrollEvent)
    }
}

const handleSelectedSegment = (event: "translation" | "reading") => {
    currentSegment.value = event
    localStorage.setItem("juzs-segment", currentSegment.value)
}

const playAllChaptersinJuz = async (ev: boolean) => {
    if (audioStore.audioPlayerSetting) {
        audioStore.audioPlayerSetting.playAllJuz = ev
    }
    if (juzStore.selectedJuz) {
        const first = juzStore.selectedJuz.chapters
        if (first) {
            await playAudio({
                audioID: Number(first[0].chapterId),
                verseKey: juzStore.getFirstVerseOfJuz?.verse_key,
                audioSrc: 'juz'
            })
        }

    }
}
</script>


<template>
    <ion-page ref="juzPageRef" :key="`juz-${juzStore.selectedJuzId}`" :id="`juz-${juzStore.selectedJuzId}`">
        <toolbar-component :route-back-label="getLine('tabs.juzs')" route-back-path="/juzs"
            :juz-id="juzStore.selectedJuzId" :selected-segment="activeSegment" id="juzs"
            :is-playing="audioStore.isPlaying" @update:selected-segment="handleSelectedSegment"
            @update:play-all-chapters="playAllChaptersinJuz">
        </toolbar-component>
        <ion-content>
            <juz-card-view-component :currentSegment="currentSegment" :id="`juz-${juzStore.selectedJuzId}-view`"
                :key="`juz-${juzStore.selectedJuzId}-view`" :is-loading="juzStore.isLoading"
                :is-playing="audioStore.isPlaying" @update:play-audio="playAudio"
                :download-progress="downloadFileProgress" :is-bismillah="selectedChapterBismillah"
                :quran-styles="computedQuranCSS" :translation-styles="computedTranslationCSS"
                :verses="juzStore.selectedJuzVerses" :computed-verses="juzStore.juzVersesByChapterMap"
                :chapter-name="selectedChapterName.nameArabic" :audio-experience="audioStore.audioPlayerSetting"
                :pagination="pagination" :is-audio-loading="audioStore.isLoading" :juz-id="juzStore.selectedJuzId"
                :active-audio-id="audioStore.audioFiles?.chapter_id" :per-page="juzStore.perPage"
                :verses-count="juzStore.versesTotalRecords" :selected-translation-id="selectedTranslationId"
                :total-juzs="juzStore.totalJuzs" :selected-juz-verse-mapping="juzStore.selectedJuzVerseMapping"
                :chapters="juzStore.getSelectedJuzChapters" :play-all-juz="audioStore.audioPlayerSetting?.playAllJuz"
                @update:get-verses="loadMoreVerses" @update:selected-translation="selectedTranslation = $event"
                @update:play-next-chapter-in-selected-juz="playNextChapterOfJuz"
                @update:end-of-juz="audioStore.closePlayer">

            </juz-card-view-component>
        </ion-content>
        <ion-footer>
            <audio-player-component :model-value="audioStore.isVisible" trigger="juzs-audio-modal"
                :selected-reciter="recitionsStore.selectedReciter" @update:model-value="audioStore.isVisible = $event"
                :map-recitions="recitionsStore.mapRecitions"
                @update:selected-reciter="recitionsStore.handleSelectedReciter($event, 'juz')" :juz-list="juzStore.juzList">
            </audio-player-component>
        </ion-footer>
    </ion-page>

</template>