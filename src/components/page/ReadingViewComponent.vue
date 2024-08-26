<script lang="ts" setup>
import { ref, watch, computed } from "vue"
import { IonButton, IonIcon, IonText } from "@ionic/vue";
import { IonGrid, IonRow, IonCol, IonCard, IonCardContent } from "@ionic/vue";
import { IonLabel, IonInfiniteScrollContent, IonRefresher, IonRefresherContent } from "@ionic/vue";
import { IonContent, IonItemDivider, IonInfiniteScroll } from "@ionic/vue";
// utils
import { useLocale } from "@/utils/useLocale";
import { useRoute, useRouter } from "vue-router";
import { upperCaseFirst } from "@/utils/string"
import { scrollToElement } from "@/utils/useScrollToElement";
// Types
import type { GroupVersesByChapterID, Pagination } from "@/types/page";
import type { PlayAudioEmit, VerseTimingsProps } from "@/types/audio";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue"
// icons
import { arrowForwardOutline, arrowBackOutline } from "ionicons/icons";
// components
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";
import CardHeaderButtonsComponent from "@/components/common/CardHeaderButtonsComponent.vue";

const route = useRoute()
const router = useRouter()
const { getLine } = useLocale()
const intersectingVerseNumber = ref(1)
const contentRef = ref()
const cardRef = ref()
const pageId = computed((): number | undefined => Number(route.params.pageId))

const props = defineProps<{
    id: string;
    isReadingView?: boolean
    downloadProgress: string | number
    isPlaying: boolean
    verseTiming?: VerseTimingsProps
    verses?: GroupVersesByChapterID
    audioExperience: { autoScroll: boolean; tooltip: boolean };
    isLoading: boolean
    isAudioLoading: boolean
    pagination?: Pagination | null
    activeAudioId?: number
    styles: Record<"fontSize" | "fontFamily" | "fontWeight", string>
}>()

const emit = defineEmits<{
    "update:getVerses": [value: { key: string, nextPage: number }];
    "update:playAudio": [value: PlayAudioEmit];
    "update:surahInfo": [value: number]
}>();


// Highlight Active Words
const isWordHighlighted = (loaction: string, verseKey: string) => {
    if (props.isReadingView) {
        if (props.verseTiming) {
            return (
                props.verseTiming.wordLocation === loaction &&
                verseKey === props.verseTiming.verseKey
            );
        }
    }
};

const ionInfinite = (ev: InfiniteScrollCustomEvent) => {
    if (props.pagination?.next_page) {
        loadMoreVerses()
        setTimeout(() => ev.target.complete(), 500);
    } else {
        ev.target.complete()
    }
}


const routeBackName = computed(() => {
    if (router.options.history.state.back) {
        return upperCaseFirst(router.options.history.state.back.toString().substring(1))
    }
    return upperCaseFirst(getLine("tabs.pages"))
})

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

const loadMoreVerses = () => {
    if (props.pagination?.next_page) {
        emit("update:getVerses", { key: props.id, nextPage: props.pagination?.next_page })
    }
}

const handleRefresh = (event: RefresherCustomEvent) => {
    if (props.pagination?.next_page) {
        setTimeout(() => {
            loadMoreVerses()
            event.target?.complete();
        }, 500);
    } else {
        event.target?.complete();
    }
};

const scroll = (verseNumber: number) => scrollToElement(`#verse-col-${verseNumber}`, cardRef.value.$el, 300)

const isPlaying = (chapterId: number) => {
    return props.isPlaying && chapterId === props.activeAudioId
}

</script>

<template>
    <div class="ion-page" :id="`${id}-${pageId}`">
        <toolbar-component :is-loading="isLoading" :route-back-label="routeBackName"></toolbar-component>
        <ion-content ref="contentRef">
            <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <ion-card class="ion-padding" v-for="(versesMap, page) in verses" :key="page" :id="`row-page-${page}`"
                ref="cardRef">
                <card-header-buttons-component :chapter-id="versesMap[0].chapter_id" :verse-key="versesMap[0].verse_key"
                    :is-playing="isPlaying(versesMap[0].chapter_id)"
                    @update:play-audio="$emit('update:playAudio', $event)" :is-audio-loading="isAudioLoading"
                    @update:surah-info="$emit('update:surahInfo', $event)" :download-progress="downloadProgress"
                    chapter-info>
                </card-header-buttons-component>
                <ion-card-content class="ion-padding quran-reader-content-wrapper">
                    <ion-grid>
                        <ion-row>
                            <ion-col class="verse-col" :id="`page-${page}`" size="12">
                                <div class="word-wrapper" v-for="verse in versesMap" :key="verse.id"
                                    :id="`line-${verse.verse_number}`" :data-hizb-number="verse.hizb_number"
                                    :data-chapter-id="verse.chapter_id" :data-juz-number="verse.juz_number"
                                    :data-page-number="page" :data-verse-number="verse.verse_number">
                                    <div v-for="word in verse.words" :key="word.id" :data-word-position="word.position"
                                        class="flex" :data-hizb-number="verse.hizb_number"
                                        :data-juz-number="verse.juz_number" :data-chapter-id="verse.chapter_id"
                                        :data-page-number="page">
                                        <ion-text :color="isWordHighlighted(word.location, word.verse_key)
                                            ? 'text-blue'
                                            : ''" class="word">
                                            <div v-if="word.char_type_name === 'end'" class="end">({{ word.text_uthmani
                                                }})
                                            </div>
                                            <h3 :style="styles" v-else>{{
                                                word.text_uthmani }}</h3>
                                        </ion-text>
                                    </div>
                                </div>
                            </ion-col>
                            <ion-col size="12">
                                <ion-item-divider>
                                    <ion-label class="m-auto">{{ getLine('quranReader.textPage') }} {{ page
                                        }}</ion-label>
                                </ion-item-divider>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-card-content>
                <div v-if="pageId" class="ion-margin-top">
                    <ion-button size="small" fill="clear" :disabled="pageId === 1" :router-link="`/page/${pageId - 1}`">
                        <ion-icon :icon="arrowBackOutline" slot="start"></ion-icon>
                        {{ getLine('quranReader.prevPage') }}
                    </ion-button>
                    <ion-button size="small" fill="clear" :disabled="pageId === 604" class="ion-float-right"
                        :router-link="`/page/${pageId + 1}`">
                        <ion-icon :icon="arrowForwardOutline" slot="start"></ion-icon>
                        {{ getLine('quranReader.nextPage') }}
                    </ion-button>
                </div>
            </ion-card>
            <ion-infinite-scroll @ion-infinite="ionInfinite">
                <ion-infinite-scroll-content loading-text="Please wait..."
                    loading-spinner="bubbles"></ion-infinite-scroll-content>
            </ion-infinite-scroll>
        </ion-content>
    </div>
</template>