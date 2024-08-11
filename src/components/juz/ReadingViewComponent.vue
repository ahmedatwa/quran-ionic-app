<script lang="ts" setup>
import { computed } from "vue"
import { IonButton, IonIcon, IonInfiniteScrollContent } from "@ionic/vue";
import { IonGrid, IonRow, IonCol, IonCard, IonCardContent } from "@ionic/vue";
import { IonLabel, IonCardSubtitle, IonCardTitle, IonChip, IonItem } from "@ionic/vue";
import { IonContent, IonCardHeader, IonInfiniteScroll } from "@ionic/vue";
// utils
import { useLocale } from "@/utils/useLocale";
import { useRoute } from "vue-router";
// Types
import type { juzVersesByPageMap } from "@/types/juz";
import type { Pagination } from "@/types/page";
import type { PlayAudioEmit, VerseTimingsProps } from "@/types/audio";
import type { InfiniteScrollCustomEvent } from "@ionic/vue"
// icons
import { pauseOutline, playOutline, informationCircleOutline } from "ionicons/icons";
// stores
import { useChapterStore } from "@/stores/ChapterStore";
// components
import ToolbarComponent from "@/components/common/ToolbarComponent.vue";

const { params } = useRoute()
const { getChapterNameByFirstVerse } = useChapterStore()
const { getLine } = useLocale()
const juzId = computed(() => Number(params.juzId))
const props = defineProps<{
    id: string;
    isReadingView: boolean
    isPlaying: boolean
    verseTiming?: VerseTimingsProps
    verses?: juzVersesByPageMap
    isLoading: boolean
    pagination?: Pagination | null
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
        emit("update:getVerses", { key: props.id, nextPage: props.pagination.next_page })
        setTimeout(() => ev.target.complete(), 500);
    } else {
        ev.target.complete()
    }
}

</script>

<template>
    <div class="ion-page" v-if="isReadingView" :id="`${id}-${juzId}`">
        <toolbar-component :is-loading="isLoading" :route-back-label="getLine('tabs.juzs')"></toolbar-component>
        <ion-content>
            <ion-card class="ion-padding" v-for="(versesMap, page) in verses" :key="page" :id="`row-page-${page}`">
                <div class="d-flex ion-justify-content-between">
                    <ion-chip
                        @click="$emit('update:playAudio', { audioID: versesMap[0].chapter_id, verseKey: versesMap[0].verse_key })"
                        color="primary">
                        <ion-icon :icon="isPlaying ? pauseOutline : playOutline"></ion-icon>
                        <ion-label>{{ getLine('quranReader.buttonPlay') }}</ion-label>
                    </ion-chip>
                    <ion-button fill="clear" @click="$emit('update:surahInfo', versesMap[0].chapter_id)">
                        <ion-icon :icon="informationCircleOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </div>
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle>{{ getChapterNameByFirstVerse(versesMap[0])?.bismillahPre ?
                        getLine('quranReader.textBismillah') : '' }}</ion-card-subtitle>
                    <ion-card-title>
                        {{ getChapterNameByFirstVerse(versesMap[0])?.nameArabic }}
                    </ion-card-title>
                </ion-card-header>
                <ion-card-content class="ion-padding quran-reader-content-wrapper">
                    <ion-grid>
                        <ion-row>
                            <ion-col class="verse-col" :id="`page-${page}`" size="12">
                                <div class="word-wrapper" v-for="v in versesMap" :key="v.id"
                                    :id="`line-${v.verse_number}`" :data-hizb-number="v.hizb_number"
                                    :data-chapter-id="v.chapter_id" :data-juz-number="v.juz_number"
                                    :data-page-number="page" :data-verse-number="v.verse_number">
                                    <div v-for="word in v.words" :key="word.id" :data-word-position="word.position"
                                        class="flex" :data-hizb-number="v.hizb_number" :data-juz-number="v.juz_number"
                                        :data-chapter-id="v.chapter_id" :data-page-number="page">
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
                                <ion-item class="ion-text-center">
                                    <ion-label class="m-auto">{{ getLine('quranReader.textPage') }} {{ page
                                        }}</ion-label>
                                </ion-item>
                            </ion-col>
                        </ion-row>
                    </ion-grid>

                </ion-card-content>
            </ion-card>
            <ion-infinite-scroll @ion-infinite="ionInfinite">
                <ion-infinite-scroll-content loading-text="Please wait..."
                    loading-spinner="bubbles"></ion-infinite-scroll-content>
            </ion-infinite-scroll>
        </ion-content>
    </div>
</template>