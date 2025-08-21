<script lang="ts" setup>
import { ref, computed, watch } from "vue"
import { IonCol, IonCard, IonCardContent, IonInfiniteScrollContent } from "@ionic/vue";
import { IonLabel, IonCardSubtitle, IonCardTitle, IonText } from "@ionic/vue";
import { IonContent, IonItemDivider, IonCardHeader, IonInfiniteScroll } from "@ionic/vue";
// router
import { useRoute } from "vue-router";
// composables
import { useScrollToElement } from "@/composables/useScrollToElement";
import { useLocale } from "@/composables/useLocale";
import { useVerseTiming } from "@/composables/useVerseTiming";
// Types
import type { Verse, MapVersesByPage, VerseWord } from "@/types/verse"
import type { Pagination } from "@/types/page";
import type { PlayAudioEmit, AudioExperience } from "@/types/audio";
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
// stores
import { useChapterStore } from "@/stores/ChapterStore";
// components
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";
import CardHeaderButtonsComponent from "@/components/common/CardHeaderButtonsComponent.vue";

const { params } = useRoute()
const { getChapterNameByChapterId } = useChapterStore()
const { getLine } = useLocale()
const intersectingVerseNumber = ref(1)
const contentRef = ref()
const cardRef = ref()
const chapterId = computed(() => Number(params.chapterId))
const { scrollToElement } = useScrollToElement()
const { verseTiming } = useVerseTiming();

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
}>()

const emit = defineEmits<{
    "update:playAudio": [value: PlayAudioEmit];
    "update:surahInfo": [value: number];
    "update:getVerses": [value: InfiniteScrollCustomEvent];
}>();

const mapVersesByPage = computed((): MapVersesByPage | undefined => {
    if (props.verses) {
        return props.verses.reduce((acc: any, obj) => {
            (acc[obj.page_number] = acc[obj.page_number] || []).push(obj);
            return acc;
        }, {});
    }
});

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

// Highlight Active Words
const isWordHighlighted = (word: VerseWord) => {
    if (verseTiming.value) {
        return verseTiming.value?.wordLocation === word.location
    }
};

const ionInfinite = (ev: InfiniteScrollCustomEvent) => {
    if (props.verses) {
        emit("update:getVerses", ev);
    }
}

const scroll = (verseNumber: number) => scrollToElement(`#line-${verseNumber}`, cardRef.value.$el)

</script>

<template>
    <div class="ion-page" :id="`${id}-${chapterId}`">
        <toolbar-component :is-loading="isLoading" :route-back-label="getLine('tabs.chapters')"></toolbar-component>
        <ion-content ref="contentRef">
            <ion-card class="ion-padding" ref="cardRef">
                <card-header-buttons-component :chapter-id="Number(params.chapterId)" :is-playing="isPlaying"
                    :download-progress="downloadProgress" @update:play-audio="$emit('update:playAudio', $event)"
                    :is-audio-loading="isAudioLoading" @update:surah-info="$emit('update:surahInfo', $event)"
                    chapter-info>
                </card-header-buttons-component>
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle>{{ getChapterNameByChapterId(Number(params.chapterId))?.bismillahPre ?
                        getLine('quranReader.textBismillah') : '' }}</ion-card-subtitle>
                    <ion-card-title>
                        {{ getChapterNameByChapterId(Number(params.chapterId))?.nameArabic }}
                    </ion-card-title>
                </ion-card-header>
                <div v-for="(verses, page) in mapVersesByPage" :key="page" :id="`row-page-${page}`">
                    <ion-card-content class="ion-padding quran-reader-content-wrapper">
                        <div class="verse-col" :id="`page-${page}`" size="12">
                            <div class="word-wrapper" v-for="verse in verses" :key="verse.id"
                                :id="`line-wrapper-${verse.verse_number}`" :data-hizb-number="verse.hizb_number"
                                :data-chapter-id="verse.chapter_id" :data-juz-number="verse.juz_number"
                                :data-page-number="page" :data-verse-number="verse.verse_number">
                                <span v-for="word in verse.words" :key="word.id" :data-word-position="word.position"
                                    :id="`line-${verse.verse_number}`" :data-hizb-number="verse.hizb_number"
                                    :data-juz-number="verse.juz_number" :data-chapter-id="verse.chapter_id"
                                    :data-page-number="page">
                                    <ion-text :color="isWordHighlighted(word) ? styles.colorCode : ''" class="word">
                                        <div v-if="word.char_type_name === 'end'" class=" end">
                                            ({{ word.text_uthmani }})
                                        </div>
                                        <h3 :style="styles" v-else>{{ word.text_uthmani }}</h3>
                                    </ion-text>
                                </span>
                            </div>
                        </div>
                        <ion-col size="12">
                            <ion-item-divider>
                                <ion-label class="m-auto">{{ getLine('quranReader.textPage') }} {{ page
                                    }}</ion-label>
                            </ion-item-divider>
                        </ion-col>
                    </ion-card-content>
                </div>
            </ion-card>
            <ion-infinite-scroll @ion-infinite="ionInfinite">
                <ion-infinite-scroll-content loading-text="Please wait..."
                    loading-spinner="bubbles"></ion-infinite-scroll-content>
            </ion-infinite-scroll>
        </ion-content>
    </div>
</template>