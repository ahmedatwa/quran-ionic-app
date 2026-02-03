<script lang="ts" setup>
import { computed, nextTick, onMounted, shallowRef, watch } from "vue"
import { IonGrid, IonRow, IonCardContent, type InfiniteScrollCustomEvent } from "@ionic/vue";
import { IonText, IonCol } from "@ionic/vue";
// composables

import { useBookmark } from "@/composables/useBookmark";
// stores
import { useVerseTimingStore } from "@/stores/VerseTimingStore";
// components
import VerseActionComponent from "@/components/common/VerseActionComponent.vue";
import VerseLoadingStateComponent from "@/components/common/VersesLoadingStateComponent.vue"
import TranslationCardContentComponent from "@/components/common/TranslationCardContentComponent.vue";
import PaginationComponent from "@/components/common/PaginationComponent.vue";
import infiniteScrollComponent from "@/components/common/infiniteScrollComponent.vue";

// types
import type { Verse } from "@/types/verse";
import type { PlayAudioEmit, AudioPlayerSettings } from "@/types/audio";
import type { ComputedQuranCSSReturn, ComputedTranslationCSSReturn } from "@/types/settings";

const intersectingVerseNumber = shallowRef<number>()
const intersectingChapterId = shallowRef<number>()
const { setBookmarked } = useBookmark()

const verseTimingStore = useVerseTimingStore()
const isPagination = computed(() => props.verses?.length === props.versesCount)
const activeWordLocation = shallowRef("")

const props = defineProps<{
    cardId: string;
    contentId: string
    currentSegment: "translation" | "reading"
    chapterId: number
    audioSrc?: string
    audioExperience: AudioPlayerSettings;
    quranStyles: ComputedQuranCSSReturn
    translationStyles?: ComputedTranslationCSSReturn
    isPlaying: boolean

    playbackSeeked?: number
    perPage: number
    verses?: Verse[]
    selectedTranslationId?: number
    versesCount?: number
}>()

const emit = defineEmits<{
    "update:playAudio": [value: PlayAudioEmit];
    "update:loadingVerses": [value: boolean]
    "update:scrollIntoElement": [value: string | number]
    "update:infiniteScrollEvent": [value: InfiniteScrollCustomEvent];
}>();

/**
 * matching local verseNumber 
 * with audio Store verse timing verse number
 * used for scroll
 */
watch(() => verseTimingStore.verseTiming, (t) => {
    if (t) {
        if (props.audioSrc === "chapter") {
            if (props.audioExperience) {
                if (props.audioExperience.autoScroll && props.isPlaying) {
                    intersectingVerseNumber.value = t.verseNumber
                    intersectingChapterId.value = t.chapterId
                    activeWordLocation.value = t.wordLocation
                }
            }
        }
    }
})

/**
 * handle auto scroll
 * base on local intersectingVerseNumber
 */
watch(intersectingVerseNumber, async (verseNumber) => {
    if (verseNumber) {
        await nextTick(() => {
            emit("update:scrollIntoElement", `#verse-col${verseNumber}-chapter${intersectingChapterId.value}`)

        })
    }
})

/**
 * on Audio seek 
 * scroll to verse location
 */
watch(() => props.playbackSeeked, (val) => {
    if (val) {
        if (verseTimingStore.verseTiming)
            intersectingVerseNumber.value = verseTimingStore.verseTiming?.verseNumber
    }
})


// just to get verse into view when inactive <=> active state 
onMounted(() => {
    if (verseTimingStore.verseTiming) {
        if (verseTimingStore.verseTiming && verseTimingStore.verseTiming?.verseNumber > props.perPage) {
            intersectingVerseNumber.value = verseTimingStore.verseTiming?.verseNumber
        }
    }
})
 

</script>
<template>
    <ion-card-content :id="contentId" :key="contentId" class="quran-translation-content-wrapper">
        <verse-loading-state-component :loading="!verses?.length" :total="perPage">
        </verse-loading-state-component>
        <ion-grid>
            <ion-row v-for="verse in verses" :key="`chapter${chapterId}-verse${verse.verse_number}`"
                :data-verse-number="verse.verse_number" :data-hizb-number="verse.hizb_number"
                :data-juz-number="verse.juz_number" class="ion-align-items-start"
                :id="`verse-col${verse.verse_number}-chapter${chapterId}`">
                <ion-col size="11" class="translations-view-col" :id="`main-verse-col-${verse.verse_number}`">
                    <ion-text v-for="word in verse.words" :key="word.id" class="ion-justify-content-between">
                        <ion-text :color="(activeWordLocation == word.location) ? quranStyles.wordColor : 'white'"
                            :id="`word-${verse.verse_number}`" class="word  ">
                            <p v-if="word.char_type_name === 'end'" class="end">
                                ({{ word.text_uthmani }})</p>
                            <p :id="`word-wrapper${verse.verse_number}`" :style="quranStyles" v-else>
                                {{ word.text_uthmani }}</p>
                        </ion-text>
                    </ion-text>
                </ion-col>
                <ion-col size="1" class="action-sheet">
                    <verse-action-component :verse="verse" :key="`verse-${verse.verse_key}`"
                        :id="`chapter-action-sheet${verse.verse_key}`" :pathId="chapterId"
                        @update:bookmarked="setBookmarked"
                        @update:play-verse-audio="emit('update:playAudio', { ...$event, audioSrc:'chapter' })">
                    </verse-action-component>
                </ion-col>
                <ion-col size="11" class="ion-text-left">
                    <translation-card-content-component :selected-translation-id="selectedTranslationId"
                        :translations="verse.translations" :key="`chapter-${verse.chapter_id}-${verse.verse_key}`"
                        :translation-styles="translationStyles"></translation-card-content-component>
                </ion-col>
            </ion-row>
        </ion-grid>

        <infinite-scroll-component :id="`chapter-${chapterId}`" :length="verses?.length"
            @update:scroll="$emit('update:infiniteScrollEvent', $event)" :total-verses-count="versesCount"
            :key="`chapter-${chapterId}`"></infinite-scroll-component>
    </ion-card-content>
    <div class="ion-margin-top" v-if="isPagination">
        <pagination-component :id="chapterId" :key="chapterId" :link="'/chapter'" type="chapters"
            :active-card-top-id="contentId"></pagination-component>
    </div>
</template>