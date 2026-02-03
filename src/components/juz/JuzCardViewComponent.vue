<script lang="ts" setup>
import { ref, computed, shallowRef, useTemplateRef } from "vue"
import { IonContent, IonCard, IonCardTitle, IonCardSubtitle, IonCardHeader } from "@ionic/vue";
// composables
import { useLocale } from "@/composables/useLocale";
// types
import type { Verse } from "@/types/verse";
import type { PlayAudioEmit, VerseTimingsProps, AudioPlayerSettings } from "@/types/audio";
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { Pagination } from "@/types/page"
import type { juzVersesByPageMap, JuzChapters, JuzVerseMapping } from "@/types/juz";
import type { ComputedQuranCSSReturn, ComputedTranslationCSSReturn } from "@/types/settings";

// components
import JuzReadingView from "@/components/juz/JuzReadingView.vue";
import JuzTranslationView from "@/components/juz/JuzTranslationView.vue";
import CardHeaderButtonsComponent from "@/components/common/CardHeaderButtonsComponent.vue";
//  stores
import { useChapterStore } from "@/stores/ChapterStore";

const cardRefs = useTemplateRef('cardRef')
const activeCard = shallowRef<string>("")
const contentRef = ref()
const { getLine } = useLocale()
const intersectingChapterId = shallowRef<number>()
const { getChapterNameByVerseKey } = useChapterStore()

const activeComponent = computed(() => {
    if (props.currentSegment) {
        return props.currentSegment === "translation" ? JuzTranslationView : JuzReadingView
    }
})

const props = defineProps<{
    id: string;
    currentSegment: "translation" | "reading"
    juzId?: number
    isTranslationsView?: boolean
    downloadProgress?: string | number
    isPlaying: boolean
    isLoading: boolean
    isAudioLoading: boolean
    audioExperience: AudioPlayerSettings;
    translatedBy?: string;
    chapterName?: string
    isBismillah: string
    computedVerses?: juzVersesByPageMap
    verses?: Verse[] | null
    pagination?: Pagination | null
    verseTiming?: VerseTimingsProps
    activeAudioId?: number
    perPage: number
    quranStyles: ComputedQuranCSSReturn
    translationStyles: ComputedTranslationCSSReturn
    selectedTranslationId?: number
    chapters?: JuzChapters[]
    totalJuzs?: number
    versesCount?: number
    lastVerseOfJuz?: number
    playAllJuz?: boolean
    selectedJuzVerseMapping?: JuzVerseMapping

}>()

defineEmits<{
    "update:getVerses": [value: InfiniteScrollCustomEvent];
    "update:playAudio": [value: PlayAudioEmit];
    "update:modalValue": [value: boolean]
    "update:playNextChapterInSelectedJuz": [{ chapterId: number, delay: number }];
    "update:endOfJuz": [value: boolean]
}>();



const isPlayingState = (chapterId: number) => props.isPlaying && chapterId === props.activeAudioId


// last Chapter of Juz
const lastChapterOfJuz = computed(() => props.chapters?.slice(-1)[0])
const versesRangeOfLastChapterOfJuz = computed(() => {
    const split = lastChapterOfJuz.value?.verses.split("-")
    if (split) {
        return {
            firstVerse: Number(split[0]), lastVerse: Number(split[1])
        }
    }
})
// first verse 
const firstChapterOfJuz = computed(() => {
    if (props.chapters) return props.chapters[0]
})
const versesRangeOfFirstChapterOfJuz = computed(() => {
    const split = firstChapterOfJuz.value?.verses.split("-")
    if (split) {
        return {
            firstVerse: Number(split[0]), lastVerse: Number(split[1])
        }
    }

})

const isCardActive = (chapterId: number | string, id: string) => {
    if (intersectingChapterId.value === Number(chapterId)) {
        activeCard.value = id
        return true
    }
    return false
}

const isBismillahPre = (verseKey: string) => {
    const name = getChapterNameByVerseKey(verseKey)
    if (name) {
        return name.bismillahPre ? getLine("quranReader.textBismillah") : ''
    }
}

const getName = (verseKey: string) => {
    const name = getChapterNameByVerseKey(verseKey)
    if (name) {
        return name.nameArabic
    }
}

const getCardsAttrsId = computed((): { id: string }[] | undefined => {
    if (cardRefs.value) {
        return cardRefs.value.map((card) => {
            return {
                id: card?.$attrs.id as string
            }
        })
    }
})

</script>
<template>
    <div class="ion-page" :id="`translations-${id}-${juzId}`">
        <ion-content class="quran-translation-content-wapper smooth-scroll-behaviour" ref="contentRef">
            <ion-card class="ion-padding card-wrapper" ref="cardRef" v-for="(mappedVerses, chapterId) in computedVerses"
                :key="chapterId" :id="`card-${chapterId}`" :active="isCardActive(chapterId, `card-${chapterId}`)">
                <card-header-buttons-component :chapter-id="mappedVerses[0].chapter_id"
                    :download-progress="downloadProgress" :verse-key="mappedVerses[0].verse_key"
                    :is-playing="isPlayingState(mappedVerses[0].chapter_id)"
                    @update:play-audio="$emit('update:playAudio', $event)" :is-audio-loading="isAudioLoading"
                    @update:language-modal-value="$emit('update:modalValue', $event)">
                </card-header-buttons-component>
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle> {{ isBismillahPre(mappedVerses[0].verse_key) }}
                    </ion-card-subtitle>
                    <ion-card-title>{{ getName(mappedVerses[0].verse_key) }} </ion-card-title>
                </ion-card-header>
                <component :is="activeComponent" :contentId="`card-content-juz-${chapterId}`" :juz-id="juzId"
                    :audio-experience="audioExperience" :is-playing="isPlaying" :play-all-juz="playAllJuz"
                    :active-audio-id="activeAudioId" :verses="mappedVerses" :per-page="perPage"
                    :mapped-verses="mappedVerses" :chapter-id="chapterId" :total-juzs="totalJuzs"
                    :selected-translation-id="selectedTranslationId" :last-verse-of-juz="lastVerseOfJuz"
                    :quran-styles="quranStyles" :translation-styles="translationStyles" :active-card="activeCard"
                    :verses-range-of-first-chapter-of-juz="versesRangeOfFirstChapterOfJuz"
                    :last-chapter-of-juz="lastChapterOfJuz" :cards-id="getCardsAttrsId"
                    :verses-range-of-last-chapter-of-juz="versesRangeOfLastChapterOfJuz"
                    :selected-juz-verse-mapping="selectedJuzVerseMapping" :verses-count="versesCount"
                     
                    @update:play-audio="$emit('update:playAudio', $event)"
                    @update:intersecting-chapter-id="intersectingChapterId = $event"
                    @update:play-next-chapter-in-selected-juz="$emit('update:playNextChapterInSelectedJuz', $event)"
                    @update:end-of-juz="$emit('update:endOfJuz', $event)"
                    @update:infinite-scroll-verses-event="$emit('update:getVerses', $event)">

                </component>
            </ion-card>

        </ion-content>
    </div>
</template>