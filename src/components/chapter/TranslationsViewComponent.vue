<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue"
import { IonIcon, IonCardHeader, IonItem, IonGrid, IonRow, IonRefresher, IonRefresherContent } from "@ionic/vue";
import { IonContent, IonNote, IonCardTitle, IonCardSubtitle } from "@ionic/vue";
import { IonLabel, IonText, IonCol, IonCard, IonInfiniteScrollContent, IonInfiniteScroll } from "@ionic/vue";
import { App } from '@capacitor/app';

// icons
import { ellipsisVerticalOutline } from "ionicons/icons";
// utils
import { useLocale } from "@/utils/useLocale";
import { scrollToElement } from "@/utils/useScrollToElement";
import { useStorage } from "@/utils/useStorage";
import { useRoute } from "vue-router";
import { useAlert } from '@/utils/useAlert';
// types
import type { Verse, VerseWord } from "@/types/verse";
import type { Pagination } from "@/types/chapter";
import type { PlayAudioEmit, VerseTimingsProps } from "@/types/audio";
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { RefresherCustomEvent } from "@ionic/vue"

// components
import VerseActionComponent from "@/components/common/VerseActionComponent.vue";
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";
import VerseSeachInputComponent from "@/components/common/VerseSeachInputComponent.vue";
import CardHeaderButtonsComponent from "@/components/common/CardHeaderButtonsComponent.vue";
// stores
import { useChapterStore } from "@/stores/ChapterStore";

const verseSearchInput = ref("")
const { getLine } = useLocale()
const { params } = useRoute()
const { setStorage, bookmarkedItems } = useStorage("__bookmarksDB")
const { getChapterName } = useChapterStore()
const { presentAlert } = useAlert()
const contentRef = ref()
const cardRef = ref()
const chapterId = computed(() => Number(params.chapterId))
const intersectingVerseNumber = ref(1)

const props = defineProps<{
    id: string;
    isTranslationsView: boolean
    isPlaying: boolean
    isLoading: boolean
    isAudioLoading: boolean
    chapterName?: string
    isBismillah: string
    verses?: Verse[]
    audioExperience: { autoScroll: boolean; tooltip: boolean };
    pagination?: Pagination | null
    verseTiming?: VerseTimingsProps
    styles: Record<"fontSize" | "fontFamily" | "fontWeight" | "color", string>
    lastChapterVerse: number
    verseCount?: number
}>()

const emit = defineEmits<{
    "update:getVerses": [value: { key: string, nextPage: number }];
    "update:playAudio": [value: PlayAudioEmit];
    "update:modalValue": [value: boolean]
}>();

const setBookmarked = async (verse: Verse) => {
    bookmarkedItems.value.push({
        key: `/page/${verse.page_number}`,
        value: {
            pageNumber: verse.page_number,
            verseNumber: verse.verse_number,
            verseText: verse.text_uthmani,
            chapterName: getChapterName(verse.chapter_id)?.nameSimple
        }
    })
    bookmarkedItems.value.forEach(({ key, value }) => {
        setStorage(key, value)
    })

    await presentAlert({
        message: "Verse Text Copied.",
    })

};

const isWordHighlighted = (word: VerseWord) => {
    if (props.verseTiming) {
        return props.verseTiming.wordLocation === word.location
    }
};

const loadMoreVerses = () => {
    if (props.pagination?.next_page) {
        emit("update:getVerses", { key: props.id, nextPage: props.pagination?.next_page })
    }
}

onMounted(() => {
    App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
            scroll(intersectingVerseNumber.value)
        }
    });
})

onUnmounted(() => App.removeAllListeners())

const ionInfinite = (ev: InfiniteScrollCustomEvent) => {
    if (props.verses?.length === props.verseCount) {
        ev.target.complete()
    } else {
        loadMoreVerses()
        setTimeout(() => ev.target.complete(), 500);
    }
}

// scrolling based on verseNumber sent by audioStore
watch(() => props.verseTiming, (t) => {
    if (t?.verseNumber) {
        const verseNumber = t.verseNumber
        if (props.audioExperience.autoScroll && props.isPlaying) {
            intersectingVerseNumber.value = t.verseNumber
            scroll(verseNumber)
        }
    }
})

const scroll = (verseNumber: number) => scrollToElement(`#verse-col-${verseNumber}`, cardRef.value.$el, 300)

const computedVerses = computed(() => {
    if (props.verses) {
        return props.verses
            .filter((v) => v.verse_number.toString().includes(verseSearchInput.value))
            .sort((a, b) => a.verse_number - b.verse_number)
    }
})

const handleRefresh = (event: RefresherCustomEvent) => {
    if (!props.pagination?.next_page) {
        event.target?.complete();
    }

    setTimeout(() => {
        loadMoreVerses()
        event.target?.complete();
    }, 500);
};
</script>
<template>
    <div class="ion-page" v-show="isTranslationsView" :id="`translations-${id}-${chapterId}`">
        <toolbar-component :route-back-label="getLine('tabs.chapters')" :is-loading="isLoading"></toolbar-component>
        <ion-content class="quran-translation-content-wapper" :fullscreen="true" :scrollY="true" ref="contentRef">
            <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <ion-card class="ion-padding card-wrapper" ref="cardRef">
                <verse-seach-input-component :verse-count="verseCount"
                    @update:search-value="verseSearchInput = $event"></verse-seach-input-component>
                <card-header-buttons-component :chapter-id="chapterId" :is-playing="isPlaying"
                    @update:play-audio="$emit('update:playAudio', $event)" :is-audio-loading="isAudioLoading"
                    @update:language-modal-value="$emit('update:modalValue', $event)">
                </card-header-buttons-component>
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle>{{ isBismillah }}</ion-card-subtitle>
                    <ion-card-title>{{ chapterName }}</ion-card-title>
                </ion-card-header>
                <ion-item v-for="verse in computedVerses" :key="verse.verse_number"
                    :data-verse-number="verse.verse_number" :data-hizb-number="verse.hizb_number"
                    :data-juz-number="verse.juz_number" :id="`verse-col-${verse.verse_number}`">
                    <ion-grid>
                        <ion-row class="ion-align-items-start">
                            <ion-col size="11" class="translations-view-col">
                                <ion-label v-for="word in verse.words" :key="word.id">
                                    <ion-text :color="isWordHighlighted(word) ? styles.color : ''"
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
                                    <span v-html="translation.text"></span>
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