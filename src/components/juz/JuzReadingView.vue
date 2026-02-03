<script lang="ts" setup>
import { ref, watch, computed, nextTick, shallowRef } from "vue"
import { IonLabel, IonText } from "@ionic/vue";
import { IonGrid, IonRow, IonCol, IonItem, IonCardContent } from "@ionic/vue";

// router
import { useRoute } from "vue-router";
// composables
import { useLocale } from "@/composables/useLocale";
import { useScrollToElement } from "@/composables/useScrollToElement";
// stores
import { useVerseTimingStore } from "@/stores/VerseTimingStore";

// Types
import type { ComputedQuranCSSReturn } from "@/types/settings";
import type { JuzChapters } from "@/types/juz";
import type { Verse, VerseWord } from "@/types/verse";
import type { PlayAudioEmit, AudioPlayerSettings } from "@/types/audio";


const { params } = useRoute()
const { getLine } = useLocale()
const intersectingVerseNumber = shallowRef<number>()
const intersectingChapterId = shallowRef<number>()
const intersectingCard = computed(() => `card-${intersectingChapterId.value}`)
const { scrollToElement } = useScrollToElement()
const juzId = computed(() => Number(params.juzId))
const verseTimingStore = useVerseTimingStore()



const props = defineProps<{
    contentId: string | number
    juzId?: number
    audioExperience: AudioPlayerSettings;
    activeCard: string
    isPlaying: boolean
    playAllJuz?: boolean
    activeAudioId?: number
    verses?: Verse[] | null
    perPage: number
    mappedVerses?: Verse[]
    chapterId: number | string
    quranStyles: ComputedQuranCSSReturn
    selectedTranslationId?: number
    lastVerseOfJuz?: number
    totalJuzs?: number
    lastVersesOfJuzWithChapterId?: { verseNumber: number, chapterId: number }[]
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
}>()

const emit = defineEmits<{
    "update:playAudio": [value: PlayAudioEmit];
    "update:playNextChapterInJuz": [value: { nextId: number, delay: number }]
    "update:lastVerseReachedOfJuz": [value: { verseNumber: number, chapterId: number }]
}>();

// scrolling based on verseNumber sent by audioStore
watch(() => verseTimingStore.verseTiming, async (t) => {
    if (t) {
        if (props.audioExperience) {
            if (props.audioExperience.autoScroll && props.isPlaying) {
                intersectingVerseNumber.value = t.verseNumber
                intersectingChapterId.value = t.chapterId
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
                if (props.lastVersesOfJuzWithChapterId) {
                    if (props.versesRangeOfLastChapterOfJuz?.lastVerse === intersectingVerseNumber.value) {
                        setTimeout(() => {
                            emit("update:lastVerseReachedOfJuz", {
                                verseNumber: Number(intersectingVerseNumber.value),
                                chapterId: t.chapterId
                            })
                        }, delay);

                    } else {
                        if (props.playAllJuz) {
                            let nextId = 0
                            props.lastVersesOfJuzWithChapterId.forEach(({ verseNumber, chapterId }) => {
                                if (verseNumber === intersectingVerseNumber.value) {
                                    return nextId = chapterId
                                }
                            })
                            if (nextId > 0) {
                                setTimeout(() => {
                                    emit("update:playNextChapterInJuz", { nextId: nextId + 1, delay })
                                }, delay);
                            }
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
                                if (intersectingChapterId.value)
                                    await scroll(verseNumber, intersectingChapterId.value, props.activeCard)
                                return
                            }
                        });
                    }
                }
            }
        })
    }
})


const scroll = (verseNumber: number, cardId: number, root: string) => scrollToElement(`#verse-card-${cardId}-${verseNumber}`, root)
const isWordHighlighted = (word: VerseWord) => verseTimingStore.verseTiming?.wordLocation === word.location

</script>

<template>
    <ion-card-content class="ion-padding quran-reader-content-wrapper">
        <ion-grid>
            <ion-row>
                <ion-col class="verse-col" :id="`juz-${juzId}`" size="12">
                    <div class="word-wrapper" v-for="v in verses" :key="v.id" :id="`line-${v.verse_number}`"
                        :data-hizb-number="v.hizb_number" :data-chapter-id="v.chapter_id"
                        :data-juz-number="v.juz_number" :data-page-number="v.page_number"
                        :data-verse-number="v.verse_number">
                        <div v-for="word in v.words" :key="word.id" :data-word-position="word.position" class="flex"
                            :data-hizb-number="v.hizb_number" :data-juz-number="v.juz_number"
                            :data-chapter-id="v.chapter_id">
                            <ion-text :color="isWordHighlighted(word)
                                ? quranStyles.wordColor
                                : ''" class="word">
                                <p v-if="word.char_type_name === 'end'" class="end">
                                    ({{ word.text_uthmani }})
                                </p>
                                <p :style="quranStyles" v-else>{{
                                    word.text_uthmani }}</p>
                            </ion-text>
                        </div>
                    </div>
                </ion-col>
                <ion-col size="12">
                    <ion-item class="ion-text-center">
                        <ion-label class="m-auto">{{ getLine('quranReader.textJuz') }} {{
                            }}</ion-label>
                    </ion-item>
                </ion-col>
            </ion-row>
        </ion-grid>
    </ion-card-content>
</template>