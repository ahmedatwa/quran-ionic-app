<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick, watchEffect, shallowRef } from "vue"
import { IonCardContent, IonIcon } from "@ionic/vue";
import { IonCol, IonRow, IonGrid, IonItem } from "@ionic/vue";
import { IonLabel, IonText } from "@ionic/vue";
// icons
import { ellipsisVerticalOutline } from "ionicons/icons";
// composables
import { useScrollToElement } from "@/composables/useScrollToElement";
import { useBookmark } from "@/composables/useBookmark";
import { useVerseTimingStore } from "@/stores/VerseTimingStore";
// utils
import { getLastVerseOfPage } from "@/utils/pages";
// types
import type { Verse, VerseWord } from "@/types/verse";
import type { PlayAudioEmit, AudioPlayerSettings } from "@/types/audio";
import type { GroupVersesByChapterID } from "@/types/page"
import type { ComputedQuranCSSReturn, ComputedTranslationCSSReturn } from "@/types/settings";
// components
import VerseActionComponent from "@/components/common/VerseActionComponent.vue";
import VerseLoadingStateComponent from "@/components/common/VersesLoadingStateComponent.vue"
import PaginationComponent from "@/components/common/PaginationComponent.vue";
import TranslationCardContentComponent from "@/components/common/TranslationCardContentComponent.vue";



const { setBookmarked } = useBookmark()
const verseTimingStore = useVerseTimingStore()
const intersectingVerseNumber = ref<number>()
const intersectingChapterId = shallowRef<number>()

const { scrollToElement } = useScrollToElement()

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
    translationStyles?: ComputedTranslationCSSReturn
    selectedTranslationId?: number
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

// just to get correct page into view when App inactive <=> active state 
onMounted(() => {
    if (verseTimingStore.verseTiming) {
        if (verseTimingStore.verseTiming?.chapterId !== props.pageId) {
            intersectingVerseNumber.value = verseTimingStore.verseTiming?.verseNumber
            intersectingChapterId.value = verseTimingStore.verseTiming.chapterId
            emit("update:activeState", true)

        }
    }
})


const scroll = async (verseNumber: number, chapterId: number) =>
    await scrollToElement(`#page-verse-col-${verseNumber}`, `#card-${chapterId}-page-${props.pageId}`)

const isWordHighlighted = (word: VerseWord) => verseTimingStore.verseTiming?.wordLocation === word.location

const loadingVersesState = computed(() => {
    if (props.versesGroup) {
        const entries = Object.entries(props.versesGroup)
        const length = entries[0][1].length
        return length
    }
})


</script>
<template>
    <ion-card-content :id="contentId" :key="contentId" class="quran-translation-content-wrapper">
        <verse-loading-state-component :loading="!loadingVersesState" :total="perPage">
        </verse-loading-state-component>
        <ion-item v-for="verse in verses" :key="verse.verse_number" :data-verse-number="verse.verse_number"
            :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number"
            :id="`page-verse-col-${verse.verse_number}`">
            <ion-grid>
                <ion-row class="ion-align-items-start">
                    <ion-col size="11" class="translations-view-col" :id="`main-verse-col-${verse.verse_number}`">
                        <ion-label v-for="word in verse.words" :key="word.id" class="word">
                            <ion-text :color="isWordHighlighted(word) ? quranStyles.wordColor : ''">
                                <p v-if="word.char_type_name === 'end'" class="end">
                                    ({{ word.text_uthmani }})</p>
                                <p :style="quranStyles" v-else>{{ word.text_uthmani }}</p>
                            </ion-text>
                        </ion-label>
                    </ion-col>
                    <ion-col size="1" class="action-sheet" :key="verse.verse_key">
                        <verse-action-component :verse="verse" :pathId="pageId"
                            :key="`page-${verse.page_number}-${verse.verse_key}`"
                            :id="`page-action-sheet${verse.verse_number}`" @update:bookmarked="setBookmarked"
                            @update:play-verse-audio="$emit('update:playAudio', $event)">
                        </verse-action-component>
                    </ion-col>
                    <ion-col size="11" class="ion-text-left">
                        <translation-card-content-component :selected-translation-id="selectedTranslationId"
                            :translations="verse.translations"
                            :translation-styles="translationStyles"></translation-card-content-component>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-item>
        <div v-if="pageId" class="ion-margin-top">
            <pagination-component :id="pageId" type="pages" link="/page"></pagination-component>
        </div>
    </ion-card-content>

</template>