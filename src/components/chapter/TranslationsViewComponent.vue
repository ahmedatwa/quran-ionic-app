<script lang="ts" setup>
import { nextTick, onMounted, ref, shallowRef, watch } from "vue"
import { IonIcon, IonCardHeader, IonItem, IonGrid, IonRow, IonPage } from "@ionic/vue";
import { IonContent, IonNote, IonCardTitle, IonCardSubtitle, IonButton } from "@ionic/vue";
import { IonLabel, IonText, IonCol, IonCard } from "@ionic/vue";
// icons
import { ellipsisVerticalOutline } from "ionicons/icons";
// composables
import { useLocale } from "@/composables/useLocale";
import { useScrollToElement } from "@/composables/useScrollToElement";
import { useBookmark } from "@/composables/useBookmark";
import { useVerseTiming } from "@/composables/useVerseTiming";
// components
import VerseActionComponent from "@/components/common/VerseActionComponent.vue";
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";
import VerseSeachInputComponent from "@/components/common/VerseSeachInputComponent.vue";
import CardHeaderButtonsComponent from "@/components/common/CardHeaderButtonsComponent.vue";
import VerseLoadingStateComponent from "@/components/common/VersesLoadingStateComponent.vue"
import infiniteScrollComponent from "@/components/common/infiniteScrollComponent.vue";
// types
import type { Verse, VerseWord } from "@/types/verse";
import type { Pagination } from "@/types/chapter";
import type { PlayAudioEmit, AudioExperience } from "@/types/audio";
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { ShallowRef } from "vue"
import type { Translation } from "@/types/translations";

const cardRef = ref()
const intersectingVerseNumber = shallowRef<number>()
const bookmarkedVerse = <ShallowRef<Verse> | null>(null)
const { getLine } = useLocale()
const { setBookmarked } = useBookmark(bookmarkedVerse)
const { scrollToElement } = useScrollToElement()
const { verseTiming, getCurrentVerseData } = useVerseTiming();

const props = defineProps<{
    id: string;
    chapterId: number
    downloadProgress?: string | number
    isPlaying: boolean
    isLoading: boolean
    isAudioLoading: boolean
    chapterName?: string
    isBismillah: string
    verses?: Verse[]
    audioExperience: AudioExperience;
    pagination?: Pagination | null
    styles: Record<"fontSize" | "fontFamily" | "fontWeight" | "colorCode", string>
    lastChapterVerse: number
    verseCount: number
    perPage: number
    selectedTranslationId?: number
    playbackSeeked?: number
    audioSrc?: string
}>()

const emit = defineEmits<{
    "update:getVerses": [value: InfiniteScrollCustomEvent];
    "update:playAudio": [value: PlayAudioEmit];
    "update:modalValue": [value: boolean]
    "update:searchValue": [value: string]
    "update:selectedTranslation": [value: Translation]
    "update:loadingVerses": [value: boolean]
}>();

/**
 * matching local verseNumber 
 * with audio Store verse timing verse number
 * used for scroll
 */
watch(() => verseTiming.value, (t) => {
    if (t) {
        if (props.audioSrc === "chapter") {
            if (props.audioExperience) {
                if (props.audioExperience.autoScroll && props.isPlaying) {
                    intersectingVerseNumber.value = t.verseNumber
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
            await scroll(verseNumber)
            if (props.isLoading) {
                emit("update:loadingVerses", false)
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

// just to get verse into view when inactive <=> active state 
onMounted(() => {
    if (verseTiming.value) {
        if (verseTiming && verseTiming.value?.verseNumber > props.perPage) {
            intersectingVerseNumber.value = verseTiming.value?.verseNumber
        }
    }
})

const scroll = async (verseNumber: number) => await scrollToElement(`#verse-col-${verseNumber}`, cardRef.value.$el)
const playAudio = (ev: PlayAudioEmit) => emit('update:playAudio', { ...ev, audioSrc: "chapter" })
const isWordHighlighted = (word: VerseWord) => verseTiming.value?.wordLocation === word.location


</script>
<template>
    <ion-page :id="`chapter-${chapterId}-translations-${id}`" :key="`chapter-${chapterId}-translations-${id}`">
        <toolbar-component :route-back-label="getLine('tabs.chapters')"
            :verse-data="getCurrentVerseData"></toolbar-component>
        <ion-content class="quran-translation-content-wapper">
            <ion-card class="ion-padding card-wrapper" ref="cardRef" id=" chapter-translation-view-card">
                <verse-seach-input-component :verse-count="verseCount"
                    @update:search-value="$emit('update:searchValue', $event)"></verse-seach-input-component>
                <card-header-buttons-component :chapter-id="chapterId" :is-playing="isPlaying"
                    :download-progress="downloadProgress" @update:play-audio="playAudio"
                    :is-audio-loading="isAudioLoading"
                    @update:selected-translation="$emit('update:selectedTranslation', $event)"
                    @update:language-modal-value="$emit('update:modalValue', $event)">
                </card-header-buttons-component>
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle>{{ isBismillah }}</ion-card-subtitle>
                    <ion-card-title>{{ chapterName }}</ion-card-title>
                </ion-card-header>
                <!-- Loading State -->
                <verse-loading-state-component :loading="!verses?.length" :total="perPage">
                </verse-loading-state-component>
                <ion-item v-for="verse in verses" :key="verse.verse_number" :data-verse-number="verse.verse_number"
                    :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number"
                    :id="`verse-col-${verse.verse_number}`">
                    <ion-grid>
                        <ion-row class="ion-align-items-start">
                            <ion-col size="11" class="translations-view-col"
                                :id="`main-verse-col-${verse.verse_number}`">
                                <ion-label v-for="word in verse.words" :key="word.id">
                                    <ion-text :color="isWordHighlighted(word) ? styles.colorCode : ''"
                                        :id="`word-${verse.verse_number}`">
                                        <span v-if="word.char_type_name === 'end'" class="end">
                                            ({{ word.text_uthmani }})</span>
                                        <h3 :style="styles" v-else>{{
                                            word.text_uthmani }}
                                        </h3>
                                    </ion-text>
                                </ion-label>
                            </ion-col>
                            <ion-col size="1" class="action-sheet">
                                <ion-button aria-label="action-sheet" size="small"
                                    :id="`open-action-sheet${verse.verse_number}`" fill="clear">
                                    <ion-icon :icon="ellipsisVerticalOutline" color="primary" slot="icon-only"
                                        aria-hidden="true">
                                    </ion-icon>
                                </ion-button>
                                <verse-action-component :verse="verse" :key="`chapter-${verse.verse_key}`"
                                    :id="`chapter-${verse.verse_key}`"
                                    :trigger-prop="`open-action-sheet${verse.verse_number}`"
                                    @update:bookmarked="setBookmarked" @update:play-verse-audio="playAudio">
                                </verse-action-component>
                            </ion-col>
                            <ion-col size="11" class="ion-text-left">
                                <ion-note v-for="translation in verse.translations" :key="translation.id"
                                    class="translation">
                                    <div v-if="selectedTranslationId === translation.resource_id">
                                        <span v-html="translation.text"></span>
                                    </div>
                                </ion-note>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-item>
            </ion-card>
            <infinite-scroll-component :id="`translations-${id}-${chapterId}`" :verse-count="verseCount"
                :length="verses?.length" @update:scroll="$emit('update:getVerses', $event)"></infinite-scroll-component>
        </ion-content>
    </ion-page>
</template>