<script lang="ts" setup>
import { computed } from "vue"
import { IonToolbar, IonButton, IonButtons, IonChip, IonIcon } from "@ionic/vue";
import { IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonInfiniteScrollContent } from "@ionic/vue";
import { IonLabel, IonProgressBar } from "@ionic/vue";
import { IonContent, IonItemDivider, IonInfiniteScroll } from "@ionic/vue";
// utils
import { useLocale } from "@/utils/useLocale";
import { useRoute, useRouter } from "vue-router";
import { upperCaseFirst } from "@/utils/string"
// Types
import type { GroupVersesByChapterID, Pagination } from "@/types/page";
import type { PlayAudioEmit, VerseTimingsProps } from "@/types/audio";
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
// icons
import { chevronBackOutline, pauseOutline, playOutline } from "ionicons/icons";
import { informationCircleOutline, arrowForwardOutline, arrowBackOutline } from "ionicons/icons";

const route = useRoute()
const router = useRouter()
const { getLine } = useLocale()
const pageId = computed((): number | undefined => Number(route.params.pageId))

const props = defineProps<{
    id: string;
    isReadingView: boolean
    isPlaying: boolean
    verseTiming?: VerseTimingsProps
    verses?: GroupVersesByChapterID
    isLoading: boolean
    pagination?: Pagination | null
    styles: Record<"fontSize" | "fontFamily" | "fontWeight", string>
}>()

const emit = defineEmits<{
    "update:getv": [value: { key: string, nextPage: number }];
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

const routerBackPath = computed(() => {
    if (props.id) {
        return props.id.split("-")[1]
    }
})

const ionInfinite = (ev: InfiniteScrollCustomEvent) => {
    if (props.pagination?.next_page) {
        emit("update:getv", { key: props.id, nextPage: props.pagination.next_page })
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

</script>

<template>
    <div class="ion-page" v-if="isReadingView" :id="`${id}-${pageId}`">
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-button @click="router.go(-1)" router-direction="back" color="primary">
                    <ion-icon :icon="chevronBackOutline"></ion-icon>
                    <ion-label>{{ routeBackName }}</ion-label>
                </ion-button>
            </ion-buttons>
            <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
        </ion-toolbar>
        <ion-content>
            <ion-card class="ion-padding" v-for="(versesMap, page) in verses" :key="page" :id="`row-page-${page}`">
                <div>
                    <ion-chip
                        @click="$emit('update:playAudio', { audioID: versesMap[0].chapter_id, verseKey: versesMap[0].verse_key })"
                        color="primary" class="ion-float-right">
                        <ion-icon :icon="isPlaying ? pauseOutline : playOutline"></ion-icon>
                        <ion-label>{{ getLine('quranReader.buttonPlay') }}</ion-label>
                    </ion-chip>
                    <ion-button fill="clear" @click="$emit('update:surahInfo', versesMap[0].chapter_id)">
                        <ion-icon :icon="informationCircleOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </div>
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
                                        <span :class="isWordHighlighted(word.location, word.verse_key)
                                            ? 'text-blue'
                                            : ''" class="word">
                                            <div v-if="word.char_type_name === 'end'" class="end">({{ word.text_uthmani
                                                }})
                                            </div>
                                            <h3 :style="styles" v-else>{{
                                                word.text_uthmani }}</h3>
                                        </span>
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