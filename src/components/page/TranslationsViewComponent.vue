<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick, watchEffect, shallowRef } from "vue"
import { IonIcon, IonCardHeader, IonCardContent } from "@ionic/vue";
import { IonContent, IonNote, IonCardSubtitle, IonCardTitle } from "@ionic/vue";
import { IonCol, IonRow, IonGrid, IonItem, IonCard } from "@ionic/vue";
import { IonLabel, IonText } from "@ionic/vue";
// icons
import { ellipsisVerticalOutline } from "ionicons/icons";
// composables
import { useLocale } from "@/composables/useLocale";
import { useScrollToElement } from "@/composables/useScrollToElement";
import { useBookmark } from "@/composables/useBookmark";
import { useVerseTiming } from "@/composables/useVerseTiming";
// utils
import { upperCaseFirst } from "@/utils/string"
import { getLastVerseOfPage } from "@/utils/pages";
// types
import type { ShallowRef } from "vue"
import type { Verse, VerseWord } from "@/types/verse";
import type { PlayAudioEmit } from "@/types/audio";
import type { GroupVersesByChapterID, Pagination } from "@/types/page"

// components
import VerseActionComponent from "@/components/common/VerseActionComponent.vue";
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";
import CardHeaderButtonsComponent from "@/components/common/CardHeaderButtonsComponent.vue";
import VerseLoadingStateComponent from "@/components/common/VersesLoadingStateComponent.vue"
import paginationComponent from "@/components/page/paginationComponent.vue";
import VerseSeachInputComponent from "@/components/common/VerseSeachInputComponent.vue";

// stores
import { useChapterStore } from "@/stores/ChapterStore";


const { getLine } = useLocale()
const { getChapterNameByFirstVerse } = useChapterStore()
const bookmarkedVerse = <ShallowRef<Verse> | null>(null)
const { setBookmarked } = useBookmark(bookmarkedVerse)
const { verseTiming, getCurrentVerseData } = useVerseTiming()
const intersectingVerseNumber = ref<number>()
const intersectingChapterId = shallowRef<number>()

const { scrollToElement } = useScrollToElement()

const props = defineProps<{
    id: string;
    isTranslationsView?: boolean
    downloadProgress?: string | number
    isPlaying: boolean
    isLoading: boolean
    isAudioLoading: boolean
    translatedBy?: string;
    audioExperience: { autoScroll: boolean; tooltip: boolean };
    chapterName?: string
    isBismillah: string
    versesGroup?: GroupVersesByChapterID
    selectedVersesLength?: number
    pagination?: Pagination | null
    activeAudioId?: number
    perPage: number
    styles: Record<"fontSize" | "fontFamily" | "fontWeight" | "colorCode", string>
    selectedTranslationId?: number
    playbackSeeked?: number
    verseCount: number
    firstVerseOfVerses?: number
    pageId?: number
}>()

const emit = defineEmits<{
    "update:playAudio": [value: PlayAudioEmit];
    "update:modalValue": [value: boolean]
    "update:loadingVerses": [value: boolean]
    "update:lastVerseReachedOfPage": [value: { verseNumber: number, chapterId: number }]
    "update:nextPageNumber": [value: number]
    "update:prevPageNumber": [value: number]
    "update:activeState": [value: boolean]

}>();


/**
 * matching local verseNumber 
 * with audio Store verse timing verse number
 * used for scroll
 */
watchEffect(async () => {
    if (verseTiming.value) {
        if (props.audioExperience) {
            if (props.audioExperience.autoScroll && props.isPlaying) {
                intersectingVerseNumber.value = verseTiming.value.verseNumber
                intersectingChapterId.value = verseTiming.value.chapterId
                // check for last verse
                // delay the event for the segment duration 
                if (props.pageId) {
                    await getLastVerseOfPage(props.pageId).then((v: Verse) => {
                        if (v.verse_number === intersectingVerseNumber.value) {
                            if (verseTiming.value?.duration) {
                                const delay = Math.ceil(verseTiming.value?.duration - 1000)
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
        if (verseTiming.value)
            intersectingVerseNumber.value = verseTiming.value?.verseNumber
    }
})

// just to get correct page into view when App inactive <=> active state 
onMounted(() => {
    if (verseTiming.value) {
        if (verseTiming.value?.chapterId !== props.pageId) {
            intersectingVerseNumber.value = verseTiming.value?.verseNumber
            intersectingChapterId.value = verseTiming.value.chapterId
            emit("update:activeState", true)

        }
    }
})

const routeBack = computed(() => {
    if (props.pageId) {
        if (props.pageId > 1) {
            return {
                name: `Page/${props.pageId - 1}`,
                path: `/page/${props.pageId - 1}`
            }
        } else {
            return {
                name: upperCaseFirst(getLine("tabs.pages")),
                path: '/pages'
            }
        }
    }
    return {
        name: upperCaseFirst(getLine("tabs.pages")),
        path: '/pages'
    }
})

const isPlaying = (chapterId: number) => props.isPlaying && chapterId === props.activeAudioId
const scroll = async (verseNumber: number, chapterId: number) =>
    await scrollToElement(`#page-verse-col-${verseNumber}`, `#card-${chapterId}-page-${props.pageId}`)

const isWordHighlighted = (word: VerseWord) => verseTiming.value?.wordLocation === word.location

const search = async (verseNumber: number | string, _chapterId: number) => {
    const el = document.querySelector((`#page-verse-col-${verseNumber}`))
    el?.scrollIntoView()

}

const loadingVersesState = computed(() => {
    if (props.versesGroup) {
        const entries = Object.entries(props.versesGroup)
        const length = entries[0][1].length
        return length
    }
})


</script>
<template>
    <div class="ion-page" :id="id" :key="id">
        <toolbar-component :route-back-label="routeBack.name" :route-back-path="routeBack.path"
            :page-id="pageId" :verse-data="getCurrentVerseData"></toolbar-component>
        <ion-content class="quran-translation-content-wapper">
            <ion-card class="ion-padding card-wrapper" v-for="(verses, cid) in versesGroup" :key="cid"
                :id="`card-${cid}-page-${pageId}`">
                <verse-seach-input-component :verse-count="verseCount"
                    @update:search-value="search($event, verses[0].chapter_id)"></verse-seach-input-component>
                <card-header-buttons-component :chapter-id="verses[0].chapter_id" :download-progress="downloadProgress"
                    :verse-key="verses[0].verse_key" :is-playing="isPlaying(verses[0].chapter_id)"
                    @update:play-audio="$emit('update:playAudio', $event)" :is-audio-loading="isAudioLoading"
                    @update:language-modal-value="$emit('update:modalValue', $event)">
                </card-header-buttons-component>
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle> {{ getChapterNameByFirstVerse(verses[0])?.bismillahPre ?
                        getLine("quranReader.textBismillah") : '' }}
                    </ion-card-subtitle>
                    <ion-card-title>{{ getChapterNameByFirstVerse(verses[0])?.nameArabic }} </ion-card-title>
                </ion-card-header>
                <hr>
                <ion-card-content :id="`cardcontent-${cid}-page-${pageId}`" :key="`cardcontent-${cid}-page-${pageId}`">
                    <verse-loading-state-component :loading="!loadingVersesState" :total="perPage">
                    </verse-loading-state-component>
                    <ion-item v-for="verse in verses" :key="verse.verse_number" :data-verse-number="verse.verse_number"
                        :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number"
                        :id="`page-verse-col-${verse.verse_number}`">
                        <ion-grid>
                            <ion-row class="ion-align-items-start">
                                <ion-col size="11" class="translations-view-col"
                                    :id="`main-verse-col-${verse.verse_number}`">
                                    <ion-label v-for="word in verse.words" :key="word.id" class="word">
                                        <ion-text :color="isWordHighlighted(word) ? styles.colorCode : ''">
                                            <h3 v-if="word.char_type_name === 'end'" class="end">
                                                ({{ word.text_uthmani }})</h3>
                                            <h3 :style="styles" v-else>{{ word.text_uthmani }}</h3>
                                        </ion-text>
                                    </ion-label>
                                </ion-col>
                                <ion-col size="1" class="action-sheet" :key="verse.verse_key">
                                    <ion-icon :icon="ellipsisVerticalOutline" color="primary"
                                        :id="`page-action-sheet-${verse.verse_number}`"></ion-icon>
                                    <verse-action-component :verse="verse" :id="verse.verse_key" :key="verse.verse_key"
                                        :trigger-prop="`page-action-sheet-${verse.verse_number}`"
                                        @update:bookmarked="setBookmarked"
                                        @update:play-verse-audio="$emit('update:playAudio', $event)">
                                    </verse-action-component>
                                </ion-col>
                                <ion-col size="11" class="ion-text-left">
                                    <ion-note v-for="translation in verse.translations" :key="translation.id"
                                        class="translation ">
                                        <div v-if="selectedTranslationId === translation.resource_id">
                                            <span v-html="translation.text"></span>
                                        </div>
                                    </ion-note>
                                </ion-col>
                            </ion-row>
                        </ion-grid>
                    </ion-item>
                    <div v-if="pageId" class="ion-margin-top">
                        <pagination-component :page-id="pageId"></pagination-component>
                    </div>
                </ion-card-content>
            </ion-card>
        </ion-content>
    </div>
</template>