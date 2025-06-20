<script lang="ts" setup>
import { ref, shallowRef, watch } from "vue"
import { IonIcon, IonCardHeader, IonItem, IonGrid, IonRow } from "@ionic/vue";
import { IonContent, IonNote, IonCardTitle, IonCardSubtitle } from "@ionic/vue";
import { IonLabel, IonText, IonCol, IonCard, IonInfiniteScrollContent, IonInfiniteScroll } from "@ionic/vue";
// icons
import { ellipsisVerticalOutline } from "ionicons/icons";
// composables
import { useLocale } from "@/composables/useLocale";
import { useScrollToElement } from "@/composables/useScrollToElement";
import { useVerseTiming } from '@/composables/useVerseTiming';
import { useBookmark } from "@/composables/useBookmark";
// stores
import { useTranslationsStore } from "@/stores/TranslationsStore";
// types
import type { Verse, VerseWord } from "@/types/verse";
import type { Pagination } from "@/types/chapter";
import type { PlayAudioEmit, AudioExperience } from "@/types/audio";
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { ShallowRef } from "vue"
// components
import VerseActionComponent from "@/components/common/VerseActionComponent.vue";
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";
import VerseSeachInputComponent from "@/components/common/VerseSeachInputComponent.vue";
import CardHeaderButtonsComponent from "@/components/common/CardHeaderButtonsComponent.vue";

const contentRef = ref()
const cardRef = ref()
const intersectingVerseNumber = shallowRef(1)
const bookmarkedVerse = <ShallowRef<Verse> | null>(null)
const translationStore = useTranslationsStore();
const { getLine } = useLocale()
const { setBookmarked } = useBookmark(bookmarkedVerse)
const { scrollToElement } = useScrollToElement()
const { verseTiming } = useVerseTiming()

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
}>()

const emit = defineEmits<{
    "update:getVerses": [value: InfiniteScrollCustomEvent];
    "update:playAudio": [value: PlayAudioEmit];
    "update:modalValue": [value: boolean]
    "update:searchValue": [value: string]
}>();

const ionInfinite = (ev: InfiniteScrollCustomEvent) => {
    if (props.verses) {
        emit("update:getVerses", ev);
    }
}

// scrolling based on verseNumber sent by audioStore
watch(() => verseTiming.value, (t) => {
    if (t?.verseNumber) {
        const verseNumber = t.verseNumber
        if (props.audioExperience) {
            if (props.audioExperience.autoScroll && props.isPlaying) {
                intersectingVerseNumber.value = t.verseNumber
                scroll(verseNumber)
            }
        }
    }
})

const scroll = async (verseNumber: number) => await scrollToElement(`#verse-col-${verseNumber}`, contentRef.value.$el)
const playAudio = (ev: PlayAudioEmit) => emit('update:playAudio', ev)
const isWordHighlighted = (word: VerseWord) => verseTiming.value?.wordLocation === word.location

</script>
<template>
    <div class="ion-page" :id="`translations-${id}-${chapterId}`">
        <toolbar-component :route-back-label="getLine('tabs.chapters')" :is-loading="isLoading"></toolbar-component>
        <ion-content class="quran-translation-content-wapper" :fullscreen="true" :scrollY="true" ref="contentRef"
            style="position: relative">
            <ion-card class="ion-padding card-wrapper" ref="cardRef" style="position: relative;"
                id=" chapter-translation-view-card">
                <verse-seach-input-component :verse-count="verseCount"
                    @update:search-value="$emit('update:searchValue', $event)"></verse-seach-input-component>
                <card-header-buttons-component :chapter-id="chapterId" :is-playing="isPlaying"
                    :download-progress="downloadProgress" @update:play-audio="playAudio"
                    :is-audio-loading="isAudioLoading"
                    @update:language-modal-value="$emit('update:modalValue', $event)">
                </card-header-buttons-component>
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle>{{ isBismillah }}</ion-card-subtitle>
                    <ion-card-title>{{ chapterName }}</ion-card-title>
                </ion-card-header>
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
                                <ion-icon :icon="ellipsisVerticalOutline" color="primary"
                                    :id="`open-action-sheet${verse.verse_number}`"></ion-icon>
                                <verse-action-component :verse="verse"
                                    :trigger-prop="`open-action-sheet${verse.verse_number}`"
                                    @update:bookmarked="setBookmarked"
                                    @update:play-verse-audio="$emit('update:playAudio', { ...$event })">
                                </verse-action-component>
                            </ion-col>
                            <ion-col size="11" class="ion-text-left">
                                <ion-note v-for="translation in verse.translations" :key="translation.id"
                                    class="translation">
                                    <div v-if="translationStore.selectedTranslationId === translation.resource_id">
                                        <span v-html="translation.text"></span>
                                    </div>
                                </ion-note>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-item>
            </ion-card>
            <ion-infinite-scroll @ion-infinite="ionInfinite">
                <ion-infinite-scroll-content loading-text="Please wait..."
                    loading-spinner="bubbles"></ion-infinite-scroll-content>
            </ion-infinite-scroll>
        </ion-content>
    </div>
</template>