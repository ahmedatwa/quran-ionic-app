<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue"
import { IonIcon, IonCardHeader, IonItem, IonGrid, IonRow, IonRefresher } from "@ionic/vue";
import { IonContent, IonNote, IonCardTitle, IonCardSubtitle, IonRefresherContent } from "@ionic/vue";
import { IonLabel, IonText, IonCol, IonCard, IonInfiniteScrollContent, IonInfiniteScroll } from "@ionic/vue";
import { App } from '@capacitor/app';
// icons
import { ellipsisVerticalOutline } from "ionicons/icons";
// composables
import { useLocale } from "@/composables/useLocale";
import { useStorage } from "@/composables/useStorage";
import { useAlert } from '@/composables/useAlert';
import { useScrollToElement } from "@/composables/useScrollToElement";
import { useVerseTiming } from '@/composables/useVerseTiming';
// stores
import { useChapterStore } from "@/stores/ChapterStore";
import { useTranslationsStore } from "@/stores/TranslationsStore";
// types
import type { Verse, VerseWord } from "@/types/verse";
import type { Pagination } from "@/types/chapter";
import type { PlayAudioEmit, AudioExperience } from "@/types/audio";
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
import type { RefresherCustomEvent } from "@ionic/vue"

// components
import VerseActionComponent from "@/components/common/VerseActionComponent.vue";
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";
import VerseSeachInputComponent from "@/components/common/VerseSeachInputComponent.vue";
import CardHeaderButtonsComponent from "@/components/common/CardHeaderButtonsComponent.vue";
// stores

const verseSearchInput = ref("")
const translationStore = useTranslationsStore();
const { getLine } = useLocale()
const { setStorage, bookmarkedItems } = useStorage("__bookmarksDB")
const { getChapterName } = useChapterStore()
const { presentAlert } = useAlert()
const contentRef = ref()
const cardRef = ref()
const intersectingVerseNumber = ref(1)
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
    verseCount?: number
}>()

const emit = defineEmits<{
    "update:getVerses": [value: { key: string, nextPage: number }];
    "update:getVerseByKey": [value: number]
    "update:playAudio": [value: PlayAudioEmit];
    "update:modalValue": [value: boolean]
}>();

const setBookmarked = async (verse: Verse) => {
    const v = bookmarkedItems.value.find(({ key }) => {
        const vNumber = key.split("-").pop()
        return Number(vNumber) === verse.verse_number

    })
    if (!v) {
        bookmarkedItems.value.push({
            key: `/page/${verse.page_number}-${verse.verse_number}`,
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
            message: getLine("quranReader.verseBookmarked"),
        })
    } else {
        await presentAlert({
            message: getLine("quranReader.verseAlreadyBookmarked"),
        })
    }
};

const isWordHighlighted = (word: VerseWord) => {
    if (verseTiming.value) {
        return verseTiming.value.wordLocation === word.location
    }
};

const loadMoreVerses = () => {
    if (props.pagination?.next_page) {
        emit("update:getVerses", { key: props.id, nextPage: props.pagination?.next_page })
    }
}

/**
 * check if app was in background with server calls 
 * disabled, check for the verse if not found 
 * get it else scroll
 */
onMounted(() => {
    App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
            const currentVerseFound = props.verses?.find(({ verse_number }) => verse_number === intersectingVerseNumber.value);
            if (!currentVerseFound) {
                emit("update:getVerseByKey", intersectingVerseNumber.value)
                nextTick(() => {
                    console.log(currentVerseFound);

                    setTimeout(() => {
                        scroll(intersectingVerseNumber.value)
                    }, 300);
                })
            } else {
                setTimeout(() => {
                    scroll(intersectingVerseNumber.value)
                }, 300);
            }
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

const scroll = async (verseNumber: number) => {
    await scrollToElement(`#verse-col-${verseNumber}`, contentRef.value.$el)
}

const computedVerses = computed(() => {
    return props.verses?.filter(({ verse_number }) =>
        verse_number.toString().includes(verseSearchInput.value)
    ).sort((a, b) => a.verse_number - b.verse_number)

})

// handle if verse number isn't found in array
watch(verseSearchInput, (newVerseInput) => {
    if (newVerseInput) {
        const found = props.verses?.find(({ verse_number }) => verse_number === Number(newVerseInput))
        if (!found) emit("update:getVerseByKey", Number(newVerseInput))
    }
})
const handleRefresh = (event: RefresherCustomEvent) => {
    if (!props.pagination?.next_page) event.target?.complete();

    setTimeout(() => {
        loadMoreVerses()
        event.target?.complete();
    }, 500);
};

const playAudio = (ev: PlayAudioEmit) => {
    emit('update:playAudio', ev)
}
</script>
<template>
    <div class="ion-page" :id="`translations-${id}-${chapterId}`">
        <toolbar-component :route-back-label="getLine('tabs.chapters')" :is-loading="isLoading"></toolbar-component>
        <ion-content class="quran-translation-content-wapper" :fullscreen="true" :scrollY="true" ref="contentRef"
            style="position: relative">
            <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <ion-card class="ion-padding card-wrapper" ref="cardRef" style="position: relative;"
                id=" chapter-translation-view-card">
                <verse-seach-input-component :verse-count="verseCount"
                    @update:search-value="verseSearchInput = $event"></verse-seach-input-component>
                <card-header-buttons-component :chapter-id="chapterId" :is-playing="isPlaying"
                    :download-progress="downloadProgress" @update:play-audio="playAudio"
                    :is-audio-loading="isAudioLoading"
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