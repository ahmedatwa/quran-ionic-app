<script lang="ts" setup>
import { ref, computed, watch, nextTick, shallowRef, ComputedRef } from "vue"
import { IonCol, IonRow, IonGrid, IonItem, IonCardContent } from "@ionic/vue";
import { IonLabel, IonText, type InfiniteScrollCustomEvent } from "@ionic/vue";
// composables
import { useScrollToElement } from "@/composables/useScrollToElement";
import { useBookmark } from "@/composables/useBookmark";
// stores
import { useVerseTimingStore } from "@/stores/VerseTimingStore";
// types
import type { Verse, VerseWord } from "@/types/verse";
import type { PlayAudioEmit, AudioPlayerSettings } from "@/types/audio";
import type { ComputedQuranCSSReturn, ComputedTranslationCSSReturn } from "@/types/settings";
import type { JuzChapters, JuzVerseMapping } from "@/types/juz";
// components
import VerseActionComponent from "@/components/common/VerseActionComponent.vue";
import VerseLoadingStateComponent from "@/components/common/VersesLoadingStateComponent.vue"
import PaginationComponent from "@/components/common/PaginationComponent.vue";
import TranslationCardContentComponent from "@/components/common/TranslationCardContentComponent.vue";
import infiniteScrollComponent from "@/components/common/infiniteScrollComponent.vue";


const verseTimingStore = useVerseTimingStore()
const intersectingVerseNumber = ref<number>()
const intersectingChapterId = shallowRef<number>()
const nextChapterIdToPlay = shallowRef<number>()
const intersectingCard = computed(() => `card-${intersectingChapterId.value}`)
const { scrollToElement } = useScrollToElement()
const { setBookmarked } = useBookmark()

const props = defineProps<{
    contentId: string
    juzId?: number
    activeCard: string
    audioExperience: AudioPlayerSettings;
    isPlaying: boolean
    playAllJuz?: boolean
    activeAudioId?: number
    verses?: Verse[] | null
    perPage: number
    mappedVerses?: Verse[]
    chapterId: number | string
    quranStyles: ComputedQuranCSSReturn
    translationStyles?: ComputedTranslationCSSReturn
    selectedTranslationId?: number
    lastVerseOfJuz?: number
    totalJuzs?: number
    versesCount?: number
    versesRangeOfFirstChapterOfJuz?: {
        firstVerse: number;
        lastVerse: number;
    }
    versesRangeOfLastChapterOfJuz?: {
        firstVerse: number;
        lastVerse: number;
    }
    cardsId?: { id: string }[]
    lastChapterOfJuz?: JuzChapters
    selectedJuzVerseMapping?: JuzVerseMapping
}>()

const emit = defineEmits<{
    "update:playAudio": [value: PlayAudioEmit];


    "update:intersectingChapterId": [value: number];
    "update:endOfJuz": [value: boolean];
    "update:playNextChapterInSelectedJuz": [{ chapterId: number, delay: number }];
    "update:infiniteScrollVersesEvent": [value: InfiniteScrollCustomEvent];
}>();


// scrolling based on verseNumber sent by audioStore
watch(() => verseTimingStore.verseTiming, async (t) => {
    if (t) {
        if (props.audioExperience) {
            if (props.audioExperience.autoScroll && props.isPlaying) {
                intersectingVerseNumber.value = t.verseNumber
                intersectingChapterId.value = t.chapterId

                emit('update:intersectingChapterId', intersectingChapterId.value)
                let delay: number = 0
                if (verseTimingStore.verseTiming?.duration) {
                    delay = Math.ceil(verseTimingStore.verseTiming?.duration - 1000)
                }
                /**
                 * scenario 1
                 * so if its the last verse of chapter 
                 * and not last verse in Juz
                 * play next chapter
                 */
                /**
                 * check for verse mapping length if > 1 
                 * play next otherwise return 
                 */
                if (props.playAllJuz) {
                    if (props.selectedJuzVerseMapping) {
                        let objectLength = Object.keys(props.selectedJuzVerseMapping).length
                        if (objectLength > 1) {
                            if (nextChapterIdToPlay.value !== nextChapterIdInSelectedJuz.value) {
                                nextChapterIdToPlay.value = nextChapterIdInSelectedJuz.value
                            }

                            // check for last verse then emit play next chapter
                            if (intersectingVerseNumber.value === getLastVerseOfPlayingChapter.value) {
                                if (nextChapterIdToPlay.value) {
                                    emitNextChapterToPlay(delay, nextChapterIdToPlay.value)
                                }
                            } else {
                                return
                            }
                        }
                    } else {
                        /**
                         * close the player if 
                         * last verse of last chapter in juz reached
                         * delay by the verse duration from versetiming
                        */
                        if (intersectingVerseNumber.value === getLastVerseOfPlayingChapter.value) {
                            setTimeout(() => {
                                emit("update:endOfJuz", true)
                            }, delay);
                        }
                    }
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
        await nextTick(async () => {
            if (intersectingChapterId.value) {
                if (props.versesRangeOfFirstChapterOfJuz?.firstVerse === verseNumber) {
                    return
                } else {
                    if (props.cardsId) {
                        props.cardsId.forEach(async ({ id }) => {
                            if (intersectingCard.value === id) {
                                if (intersectingChapterId.value) {
                                    await scrollToElement(`#verse-card-item-${intersectingChapterId.value}-${verseNumber}`, `#card-${intersectingChapterId.value}`)
                                }
                            }
                        });
                    }
                }
            }
        })
    }
})

const isWordHighlighted = (word: VerseWord) => verseTimingStore.verseTiming?.wordLocation === word.location

const isPaginationVisible = (chapterId: number | string): boolean | undefined => {
    return chapterId === props.lastChapterOfJuz?.chapterId &&
        props.versesRangeOfLastChapterOfJuz?.lastVerse === props.lastVerseOfJuz
}


/**
 * get last verse of current playing chapter
 */

const getChapterIdsInSelectedJuz = computed(() => {
    if (props.selectedJuzVerseMapping) {
        return Object.keys(props.selectedJuzVerseMapping)
    }
})

const nextChapterIdInSelectedJuz = computed((): number | undefined => {
    if (getChapterIdsInSelectedJuz.value) {
        const nextIndex = getChapterIdsInSelectedJuz.value.indexOf(String(intersectingChapterId.value)) + 1
        const next = getChapterIdsInSelectedJuz.value.at(nextIndex);
        return Number(next)
    }
})

const getLastVerseOfPlayingChapter = computed(() => {
    if (intersectingChapterId.value) {
        if (props.selectedJuzVerseMapping) {
            const [_first, last] = props.selectedJuzVerseMapping[intersectingChapterId.value].split("-")
            return Number(last)
        }
    }
})

/**
 * play next chapter in juz
 * @param delay 
 * @param chapterId 
 */

const emitNextChapterToPlay = (delay: number, chapterId?: number) => {
    if (chapterId) {
        setTimeout(() => {
            emit("update:playNextChapterInSelectedJuz", {
                chapterId,
                delay
            })
        }, delay);
    }
}

</script>
<template>
    <ion-card-content :id="contentId" :key="contentId" class="quran-translation-content-wrapper">
        <verse-loading-state-component :loading="!verses?.length" :total="perPage">
        </verse-loading-state-component>
        <ion-grid :id="contentId">
            <ion-row v-for="verse in mappedVerses" :key="verse.verse_number" :data-verse-number="verse.verse_number"
                :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number"
                :id="`verse-card-item-${verse.chapter_id}-${verse.verse_number}`" class="ion-align-items-start">
                <ion-col size="11" class="translations-view-col">
                    <ion-label v-for="word in verse.words" :key="word.id" class="word">
                        <ion-text :color="isWordHighlighted(word) ? quranStyles.wordColor : 'white'">
                            <p v-if="word.char_type_name === 'end'" class="end">
                                ({{ word.text_uthmani }})</p>
                            <p :style="quranStyles" v-else>{{ word.text_uthmani }}</p>
                        </ion-text>
                    </ion-label>
                </ion-col>
                <ion-col size="1" class="action-sheet">
                    <verse-action-component :verse="verse" :id="`juz-action-sheet${verse.verse_number}`" :pathId="juzId"
                        @update:bookmarked="setBookmarked" :key="`juz-${verse.juz_number}-${verse.verse_key}`"
                        @update:play-verse-audio="$emit('update:playAudio', { ...$event })">
                    </verse-action-component>
                </ion-col>
                <ion-col size="11" class="ion-text-left">
                    <translation-card-content-component :selected-translation-id="selectedTranslationId"
                        :translations="verse.translations"
                        :translation-styles="translationStyles"></translation-card-content-component>
                </ion-col>
            </ion-row>
        </ion-grid>
    </ion-card-content>
    <infinite-scroll-component :id="`translations-juz-${juzId}`" :verse-count="versesCount" :length="verses?.length"
        @update:scroll="$emit('update:infiniteScrollVersesEvent', $event)"></infinite-scroll-component>
    <div v-if="isPaginationVisible(chapterId)" class="ion-margin-top">
        <pagination-component :id="juzId" link="/juz" type="juzs" :total-juzs="totalJuzs"
            :active-card-top-id="contentId"></pagination-component>
    </div>
</template>