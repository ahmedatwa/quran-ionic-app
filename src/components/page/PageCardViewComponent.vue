<script lang="ts" setup>
import { computed } from "vue"
import { IonCardHeader, IonCard } from "@ionic/vue";
import { IonContent, IonCardSubtitle, IonCardTitle } from "@ionic/vue";
// types
import type { PlayAudioEmit, AudioPlayerSettings } from "@/types/audio";
import type { GroupVersesByChapterID, Pagination } from "@/types/page"
import type { ComputedQuranCSSReturn, ComputedTranslationCSSReturn } from "@/types/settings";

// components
import CardHeaderButtonsComponent from "@/components/common/CardHeaderButtonsComponent.vue";
import VerseSeachInputComponent from "@/components/common/VerseSeachInputComponent.vue";
import PageTranslationView from "@/components/page/PageTranslationView.vue";
import PageReadingView from "@/components/page/PageReadingView.vue";
// stores
import { useChapterStore } from "@/stores/ChapterStore";

const { isBismillahPre, getChapterArabicName } = useChapterStore()
const activeComponent = computed(() => {
    if (props.currentSegment) {
        return props.currentSegment === "translation" ? PageTranslationView : PageReadingView
    }
})

const props = defineProps<{
    id: string;
    currentSegment: "translation" | "reading"
    downloadProgress?: string | number
    isPlaying: boolean
    isLoading: boolean
    isAudioLoading: boolean
    translatedBy?: string;
    audioExperience: AudioPlayerSettings;
    chapterName?: string
    isBismillah: string
    versesGroup?: GroupVersesByChapterID
    selectedVersesLength?: number
    pagination?: Pagination | null
    activeAudioId?: number
    perPage: number
    quranStyles: ComputedQuranCSSReturn
    translationStyles: ComputedTranslationCSSReturn
    selectedTranslationId?: number
    playbackSeeked?: number
    verseCount: number
    firstVerseOfVerses?: number
    pageId?: number
}>()

defineEmits<{
    "update:playAudio": [value: PlayAudioEmit];
    "update:modalValue": [value: boolean]
    "update:loadingVerses": [value: boolean]
    "update:lastVerseReachedOfPage": [value: { verseNumber: number, chapterId: number }]
    "update:nextPageNumber": [value: number]
    "update:prevPageNumber": [value: number]
    "update:activeState": [value: boolean]
    "update:surahInfo": [value: number]
}>();


/**
 * matching local verseNumber 
 * with audio Store verse timing verse number
 * used for scroll
 */
// watchEffect(async () => {
//     if (verseTiming.value) {
//         if (props.audioExperience) {
//             if (props.audioExperience.autoScroll && props.isPlaying) {
//                 intersectingVerseNumber.value = verseTiming.value.verseNumber
//                 intersectingChapterId.value = verseTiming.value.chapterId
//                 // check for last verse
//                 // delay the event for the segment duration 
//                 if (props.pageId) {
//                     await getLastVerseOfPage(props.pageId).then((v: Verse) => {
//                         if (v.verse_number === intersectingVerseNumber.value) {
//                             if (verseTiming.value?.duration) {
//                                 const delay = Math.ceil(verseTiming.value?.duration - 1000)
//                                 setTimeout(() => {
//                                     emit("update:lastVerseReachedOfPage", {
//                                         verseNumber: Number(intersectingVerseNumber.value),
//                                         chapterId: v.chapter_id
//                                     })
//                                 }, delay);
//                             }
//                         }
//                     })
//                 }
//             }
//         }
//     }
// })


/**
 * handle auto scroll
 * base on local intersectingVerseNumber
 */
// watch(intersectingVerseNumber, async (verseNumber) => {
//     if (verseNumber) {
//         await nextTick(async () => {
//             if (intersectingChapterId.value) {
//                 if (props.firstVerseOfVerses === verseNumber) {
//                     return
//                 } else {
//                     await scroll(verseNumber, intersectingChapterId.value)
//                 }
//                 if (props.isLoading) {
//                     emit("update:loadingVerses", false)
//                 }
//             }
//         })
//     }
// })

/**
 * on Audio seek 
 * scroll to verse location
 */
// watch(() => props.playbackSeeked, (val) => {
//     if (val) {
//         if (verseTiming.value)
//             intersectingVerseNumber.value = verseTiming.value?.verseNumber
//     }
// })

// just to get correct page into view when App inactive <=> active state 
// onMounted(() => {
//     if (verseTiming.value) {
//         if (verseTiming.value?.chapterId !== props.pageId) {
//             intersectingVerseNumber.value = verseTiming.value?.verseNumber
//             intersectingChapterId.value = verseTiming.value.chapterId
//             emit("update:activeState", true)

//         }
//     }
// })


const isPlayingState = (chapterId: number) => props.isPlaying && chapterId === props.activeAudioId
const searchVerse = async (verseNumber: number | string, _chapterId: number) => {
    const el = document.querySelector((`#page-verse-col-${verseNumber}`))
    el?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
}

/**
 * hide page {number} text at the card bottom 
 * if index {pageNubmer} in verseGroup is only one
 * @returns number | undefined
 */

const verseGroupIndexLength = computed((): number | undefined => {
    if (props.versesGroup) {
        return Object.keys(props.versesGroup).length
    }
})

</script>
<template>
    <ion-content class="quran-translation-content-wapper">
        <ion-card class="ion-padding card-wrapper" v-for="(verses, index) in versesGroup" :key="index"
            :id="`card-${index}-page-${pageId}`">
            <verse-seach-input-component :verse-count="verseCount"
                @update:search-value="searchVerse($event, verses[0].chapter_id)"></verse-seach-input-component>
            <card-header-buttons-component :chapter-id="verses[0].chapter_id" :download-progress="downloadProgress"
                :verse-key="verses[0].verse_key" :is-playing="isPlayingState(verses[0].chapter_id)"
                @update:play-audio="$emit('update:playAudio', $event)" :is-audio-loading="isAudioLoading"
                @update:language-modal-value="$emit('update:modalValue', $event)">
            </card-header-buttons-component>
            <ion-card-header class="ion-text-center">
                <ion-card-subtitle> {{ isBismillahPre(verses[0].chapter_id) }}
                </ion-card-subtitle>
                <ion-card-title>{{ getChapterArabicName(verses[0].chapter_id) }} </ion-card-title>
            </ion-card-header>
            <component :is="activeComponent" :page-index="index" :contentId="`cardcontent-${index}-page-${pageId}`"
                :page-id="pageId" :per-page="perPage" :audio-experience="audioExperience" :is-playing="isPlaying"
                :is-loading="isLoading" :first-verse-of-verses="firstVerseOfVerses" :active-audio-id="activeAudioId"
                :playback-seeked="playbackSeeked" :verses-group="versesGroup" :verses="verses"
                :quran-styles="quranStyles" :translation-styles="translationStyles"
                :selected-translation-id="selectedTranslationId" :pages-index-length="verseGroupIndexLength"
                @update:play-audio="$emit('update:playAudio', $event)"
                @update:loading-verses="$emit('update:loadingVerses', $event)"
                @update:last-verse-reached-of-page="$emit('update:lastVerseReachedOfPage', $event)"
                @update:active-state="$emit('update:activeState', $event)"
                @update:surah-info="$emit('update:surahInfo', $event)">
            </component>
        </ion-card>
    </ion-content>
</template>