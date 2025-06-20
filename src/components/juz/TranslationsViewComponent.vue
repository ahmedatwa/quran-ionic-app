<script lang="ts" setup>
import { ref, computed, watch } from "vue"
import { IonIcon, IonCardHeader } from "@ionic/vue";
import { IonContent, IonNote, IonCardTitle, IonCardSubtitle } from "@ionic/vue";
import { IonCol, IonRow, IonGrid, IonItem, IonCard } from "@ionic/vue";
import { IonLabel, IonText } from "@ionic/vue";
import { IonInfiniteScrollContent, IonInfiniteScroll } from "@ionic/vue";
// icons
import { ellipsisVerticalOutline } from "ionicons/icons";
// composables
import { useLocale } from "@/composables/useLocale";
import { useScrollToElement } from "@/composables/useScrollToElement";
import { useVerseTiming } from '@/composables/useVerseTiming';
// router
import { useRoute } from "vue-router";
// types
import type { ShallowRef } from "vue"
import type { Verse, VerseWord } from "@/types/verse";
import type { PlayAudioEmit, VerseTimingsProps } from "@/types/audio";
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { Pagination } from "@/types/page"
import type { juzVersesByPageMap } from "@/types/juz";

// components
import VerseActionComponent from "@/components/common/VerseActionComponent.vue";
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";
import CardHeaderButtonsComponent from "@/components/common/CardHeaderButtonsComponent.vue";
import { useBookmark } from "@/composables/useBookmark";
// stores
import { useChapterStore } from "@/stores/ChapterStore";

const cardRef = ref()
const contentRef = ref()
const bookmarkedVerse = <ShallowRef<Verse> | null>(null)
const { getLine } = useLocale()
const { verseTiming } = useVerseTiming()
const { getChapterNameByFirstVerse } = useChapterStore()
const { params } = useRoute()
const juzId = computed(() => Number(params.juzId))
const intersectingVerseNumber = ref<number>()
const { scrollToElement } = useScrollToElement()
const { setBookmarked } = useBookmark(bookmarkedVerse)


const props = defineProps<{
    id: string;
    isTranslationsView?: boolean
    downloadProgress?: string | number
    isPlaying: boolean
    isLoading: boolean
    isAudioLoading: boolean
    audioExperience: { autoScroll: boolean; tooltip: boolean };
    translatedBy?: string;
    chapterName?: string
    isBismillah: string
    computedVerses?: juzVersesByPageMap
    verses?: Verse[] | null
    pagination?: Pagination | null
    verseTiming?: VerseTimingsProps
    activeAudioId?: number
    styles: Record<"fontSize" | "fontFamily" | "fontWeight" | "colorCode", string>
    selectedTranslationId?: number
}>()

const emit = defineEmits<{
    "update:getVerses": [value: InfiniteScrollCustomEvent];
    "update:playAudio": [value: PlayAudioEmit];
    "update:modalValue": [value: boolean]
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


const scroll = (verseNumber: number) => scrollToElement(`#verse-col-${verseNumber}`, cardRef.value.$el)
const isPlaying = (chapterId: number) => props.isPlaying && chapterId === props.activeAudioId
const isWordHighlighted = (word: VerseWord) => verseTiming.value?.wordLocation === word.location

</script>
<template>
    <div class="ion-page" :id="`translations-${id}-${juzId}`">
        <toolbar-component :route-back-label="getLine('tabs.juzs')" :is-loading="isLoading"></toolbar-component>
        <ion-content class="quran-translation-content-wapper smooth-scroll-behaviour" :fullscreen="true" :scrollY="true"
            ref="contentRef" style="position: relative">
            <ion-card class="ion-padding card-wrapper" ref="cardRef" v-for="(mappedVerses, chapterId) in computedVerses"
                :key="chapterId" :id="`card-${chapterId}`">
                <card-header-buttons-component :chapter-id="mappedVerses[0].chapter_id"
                    :download-progress="downloadProgress" :verse-key="mappedVerses[0].verse_key"
                    :is-playing="isPlaying(mappedVerses[0].chapter_id)"
                    @update:play-audio="$emit('update:playAudio', $event)" :is-audio-loading="isAudioLoading"
                    @update:language-modal-value="$emit('update:modalValue', $event)">
                </card-header-buttons-component>
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle> {{ getChapterNameByFirstVerse(mappedVerses[0])?.bismillahPre ?
                        getLine("quranReader.textBismillah") : '' }}
                    </ion-card-subtitle>
                    <ion-card-title>{{ getChapterNameByFirstVerse(mappedVerses[0])?.nameArabic }} </ion-card-title>
                </ion-card-header>
                <hr>
                <ion-item v-for="verse in mappedVerses" :key="verse.verse_number"
                    :data-verse-number="verse.verse_number" :data-hizb-number="verse.hizb_number"
                    :data-juz-number="verse.juz_number" :id="`verse-col-${verse.verse_number}`">
                    <ion-grid>
                        <ion-row class="ion-align-items-start">
                            <ion-col size="11" class="translations-view-col"
                                :id="`main-verse-col-${verse.verse_number}`">
                                <ion-label v-for="word in verse.words" :key="word.id">
                                    <ion-text :color="isWordHighlighted(word) ? styles.colorCode : ''">
                                        <span v-if="word.char_type_name === 'end'" class="end">
                                            ({{ word.text_uthmani }})</span>
                                        <h3 :style="styles" v-else>{{ word.text_uthmani }}</h3>
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
                                    <div v-if="selectedTranslationId === translation.resource_id">
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