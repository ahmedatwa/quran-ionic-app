<script lang="ts" setup>
import { computed, watchEffect } from "vue"
import { nextTick, watch, shallowRef } from "vue"
import { IonGrid, IonRow, IonCol, IonText, IonCardContent } from "@ionic/vue";
import { IonItemDivider, IonLabel } from "@ionic/vue";
// utils
import { getLastVerseOfPage } from "@/utils/pages";
// composables
import { useLocale } from "@/composables/useLocale";
import { useScrollToElement } from "@/composables/useScrollToElement";
// stores
import { useVerseTimingStore } from "@/stores/VerseTimingStore";
// Types
import type { GroupVersesByChapterID } from "@/types/page";
import type { PlayAudioEmit, AudioPlayerSettings } from "@/types/audio";
import type { ComputedQuranCSSReturn, ComputedTranslationCSSReturn } from "@/types/settings";
import type { VerseWord, Verse } from "@/types/verse";
// components
import PaginationComponent from "@/components/common/PaginationComponent.vue";


const { getLine } = useLocale()
const { scrollToElement } = useScrollToElement()
const verseTimingStore = useVerseTimingStore()
const intersectingVerseNumber = shallowRef<number>()
const intersectingChapterId = shallowRef<number>()


const props = defineProps<{
    contentId: string
    pageIndex: number | string
    pageId?: number
    perPage: number
    audioExperience: AudioPlayerSettings;
    isPlaying: boolean
    isLoading: boolean
    firstVerseOfVerses?: number
    activeAudioId?: number
    playbackSeeked?: number
    versesGroup?: GroupVersesByChapterID /// check
    verses: Verse[]
    quranStyles: ComputedQuranCSSReturn
    selectedTranslationId?: number
    pagesIndexLength?: number
}>()

const emit = defineEmits<{
    "update:playAudio": [value: PlayAudioEmit];
    "update:loadingVerses": [value: boolean]
    "update:lastVerseReachedOfPage": [value: { verseNumber: number, chapterId: number }]
    "update:activeState": [value: boolean]
}>();

/**
 * matching local verseNumber 
 * with audio Store verse timing verse number
 * used for scroll
 */
watchEffect(async () => {
    if (verseTimingStore.verseTiming) {
        if (props.audioExperience) {
            if (props.audioExperience.autoScroll && props.isPlaying) {
                intersectingVerseNumber.value = verseTimingStore.verseTiming.verseNumber
                intersectingChapterId.value = verseTimingStore.verseTiming.chapterId
                // check for last verse
                // delay the event for the segment duration 
                if (props.pageId) {
                    await getLastVerseOfPage(props.pageId).then((v: Verse) => {
                        if (v.verse_number === intersectingVerseNumber.value) {
                            if (verseTimingStore.verseTiming?.duration) {
                                const delay = Math.ceil(verseTimingStore.verseTiming?.duration - 1000)
                                setTimeout(() => {
                                    emit("update:lastVerseReachedOfPage", {
                                        verseNumber: Number(intersectingVerseNumber.value),
                                        chapterId: v.chapter_id
                                    })
                                }, delay);
                            }
                        }
                    })
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
                if (props.firstVerseOfVerses === verseNumber) {
                    return
                } else {
                    await scroll(verseNumber, intersectingChapterId.value)
                }
                if (props.isLoading) {
                    emit("update:loadingVerses", false)
                }
            }
        })
    }
})


const isWordHighlighted = (word: VerseWord) => verseTimingStore.verseTiming?.wordLocation === word.location
const scroll = async (verseNumber: number, chapterId: number) =>
    await scrollToElement(`#page-verse-col-${verseNumber}`, `#card-${chapterId}-page-${props.pageId}`)

</script>

<template>
    <ion-card-content class="ion-padding" :id="contentId">
        <ion-grid>
            <ion-row class="word-wrapper " v-for="verse in verses" :key="verse.id" :data-hizb-number="verse.hizb_number"
                :data-chapter-id="verse.chapter_id" :data-juz-number="verse.juz_number" :data-page-number="pageIndex"
                :data-verse-number="verse.verse_number" size="10" :id="`verse-row-${verse.verse_key}`">
                <ion-col v-for="word in verse.words" :key="word.id" :data-word-position="word.position"
                    :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number"
                    :id="`word-line-${word.position}`" :data-chapter-id="verse.chapter_id"
                    :data-page-number="pageIndex">
                    <ion-text :color="isWordHighlighted(word)
                        ? quranStyles.wordColor
                        : ''" class="word">
                        <p v-if="word.char_type_name === 'end'" class="end">
                            ({{ word.text_uthmani }})
                        </p>
                        <p :style="quranStyles" v-else>{{
                            word.text_uthmani }}</p>
                    </ion-text>
                </ion-col>
                <ion-col size="12" v-if="pagesIndexLength && pagesIndexLength > 1">
                    <ion-item-divider>
                        <ion-label class="m-auto">
                            {{ getLine('quranReader.textPage') }} {{ pageIndex }}</ion-label>
                    </ion-item-divider>
                </ion-col>
            </ion-row>
        </ion-grid>
    </ion-card-content>
    <div v-if="pageId" class="ion-margin-top">
        <pagination-component :id="pageId" type="pages" link="/page"></pagination-component>
    </div>
</template>