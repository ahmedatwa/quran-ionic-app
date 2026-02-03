<script lang="ts" setup>
import { computed, shallowRef, useTemplateRef } from "vue"
import { IonCardHeader, IonPage, IonCard } from "@ionic/vue";
import { IonContent, IonCardTitle, IonCardSubtitle } from "@ionic/vue";

// composables
import { useScrollToElement } from "@/composables/useScrollToElement";

// components
import VerseSeachInputComponent from "@/components/common/VerseSeachInputComponent.vue";
import CardHeaderButtonsComponent from "@/components/common/CardHeaderButtonsComponent.vue";
import ChapterReadingView from "@/components/chapter/ChapterReadingView.vue";
import ChapterTranslationView from "@/components/chapter/ChapterTranslationView.vue";
// types
import type { Verse } from "@/types/verse";
import type { Pagination } from "@/types/chapter";
import type { PlayAudioEmit, AudioPlayerSettings } from "@/types/audio";
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { Translation } from "@/types/translations";
import type { ComputedQuranCSSReturn, ComputedTranslationCSSReturn } from "@/types/settings";

const cardRef = useTemplateRef('cardRef')
const intersectingChapterId = shallowRef<number>()
const { scrollToElement } = useScrollToElement()

const activeComponent = computed(() => {
    if (props.currentSegment) {
        return props.currentSegment === "translation" ? ChapterTranslationView : ChapterReadingView
    }
})

const activeCardId = computed(() => {
    if (props.currentSegment === "translation") {
        return `card${props.chapterId}-translation-view`
    }
    return `card${props.chapterId}-reading-view`
})
const isChapterInfo = computed(() => props.currentSegment === "reading")

const props = defineProps<{
    id: string;
    chapterId: number
    currentSegment: "translation" | "reading"
    downloadProgress?: string | number
    isPlaying: boolean
    isLoading: boolean
    isAudioLoading: boolean
    chapterName?: string
    isBismillah: string
    verses?: Verse[]
    audioExperience: AudioPlayerSettings;
    pagination?: Pagination | null
    quranStyles: ComputedQuranCSSReturn
    translationStyles: ComputedTranslationCSSReturn
    lastChapterVerse: number
    perPage: number
    selectedTranslationId?: number
    playbackSeeked?: number
    audioSrc?: string
    versesCount?: number
}>()

const emit = defineEmits<{
    "update:getVerses": [value: InfiniteScrollCustomEvent];
    "update:playAudio": [value: PlayAudioEmit];
    "update:modalValue": [value: boolean]
    "update:searchValue": [value: string]
    "update:selectedTranslation": [value: Translation]
    "update:loadingVerses": [value: boolean]
    "update:surahInfo": [value: number]
}>();


const scroll = async (rowId: string) => {
    await scrollToElement(rowId, `#${activeCardId.value}`)
    if (props.isLoading) {
        emit("update:loadingVerses", false)
    }
}

</script>
<template>
    <ion-page :id="id" :key="id">
        <ion-content class="quran-translation-content-wapper">
            <ion-card class="ion-padding card-wrapper" ref="cardRef" :id="activeCardId" :key="chapterId">
                <verse-seach-input-component :verse-count="versesCount"
                    @update:search-value="$emit('update:searchValue', $event)"></verse-seach-input-component>
                <card-header-buttons-component :chapter-id="chapterId" :is-playing="isPlaying"
                    :download-progress="downloadProgress"
                    @update:play-audio="$emit('update:playAudio', { ...$event, audioSrc: 'chapter' })"
                    :is-audio-loading="isAudioLoading" :chapter-info="isChapterInfo"
                    @update:selected-translation="$emit('update:selectedTranslation', $event)"
                    @update:language-modal-value="$emit('update:modalValue', $event)"
                    @update:surah-info="$emit('update:surahInfo', $event)">
                </card-header-buttons-component>
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle>{{ isBismillah }}</ion-card-subtitle>
                    <ion-card-title>{{ chapterName }}</ion-card-title>
                </ion-card-header>
                <component :is="activeComponent" :key="activeCardId" :content-id="`chapter-card-content-${id}`"
                    :card-id="activeCardId" :chapterId="chapterId" :audioSrc="audioSrc"
                    :audio-experience="audioExperience" :quran-styles="quranStyles" :is-playing="isPlaying"
                    :current-segment="currentSegment" :playback-seeked="playbackSeeked" :per-page="perPage"
                    :verses="verses" :verses-count="versesCount" :selected-translation-id="selectedTranslationId"
                    :translation-styles="translationStyles" @update:play-audio="$emit('update:playAudio', $event)"
                    @update:surah-info="$emit('update:surahInfo', $event)" @update:scroll-into-element="scroll($event)"
                    @update:infinite-scroll-event="$emit('update:getVerses', $event)">
                </component>
            </ion-card>
        </ion-content>
    </ion-page>
</template>