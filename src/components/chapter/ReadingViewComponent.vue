<script lang="ts" setup>
import { computed } from "vue"
import { IonButton, IonChip, IonIcon, IonText } from "@ionic/vue";
import { IonCol, IonCard, IonCardContent, IonInfiniteScrollContent } from "@ionic/vue";
import { IonLabel, IonCardSubtitle, IonCardTitle } from "@ionic/vue";
import { IonContent, IonItemDivider, IonCardHeader, IonInfiniteScroll } from "@ionic/vue";
// utils
import { useLocale } from "@/utils/useLocale";
import { useRoute } from "vue-router";
// Types
import type { Verse, MapVersesByPage, VerseWord } from "@/types/verse"
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
const chapterId = computed(() => Number(params.chapterId))

const props = defineProps<{
    id: string;
    isReadingView: boolean
    isPlaying: boolean
    verseTiming?: VerseTimingsProps
    verses?: Verse[]
    isLoading: boolean
    pagination?: Pagination | null
    styles: Record<"fontSize" | "fontFamily" | "fontWeight" | "color", string>
}>()

const emit = defineEmits<{
    "update:getVerses": [value: { key: string, nextPage: number }];
    "update:playAudio": [value: PlayAudioEmit];
    "update:surahInfo": [value: number]
}>();

const mapVersesByPage = computed((): MapVersesByPage | undefined => {
    if (props.verses) {
        return props.verses.reduce((acc: any, obj) => {
            (acc[obj.page_number] = acc[obj.page_number] || []).push(obj);
            return acc;
        }, {});
    }
});

// Highlight Active Words
const isWordHighlighted = (word: VerseWord) => {
    if (props.verseTiming) {                        
        return props.verseTiming.wordLocation === word.location
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
    <div class="ion-page" v-if="isReadingView" :id="`${id}-${chapterId}`">
        <toolbar-component :is-loading="isLoading" :route-back-label="getLine('tabs.chapters')"></toolbar-component>
        <ion-content>
            <ion-card class="ion-padding" v-for="(verses, page) in mapVersesByPage" :key="page"
                :id="`row-page-${page}`">
                <div class="d-flex ion-justify-content-between">
                    <ion-chip @click="$emit('update:playAudio', { audioID: verses[0].chapter_id })" color="primary">
                        <ion-icon :icon="isPlaying ? pauseOutline : playOutline"></ion-icon>
                        <ion-label>{{ getLine('quranReader.buttonPlay') }}</ion-label>
                    </ion-chip>
                    <ion-button fill="clear" @click="$emit('update:surahInfo', verses[0].chapter_id)">
                        <ion-icon :icon="informationCircleOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </div>
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle>{{ getChapterNameByFirstVerse(verses[0])?.bismillahPre ?
                        getLine('quranReader.textBismillah') : '' }}</ion-card-subtitle>
                    <ion-card-title>
                        {{ getChapterNameByFirstVerse(verses[0])?.nameArabic }}
                    </ion-card-title>
                </ion-card-header>
                <ion-card-content class="ion-padding quran-reader-content-wrapper">
                    <!-- <ion-grid>
                        <ion-row> -->
                    <div class="verse-col" :id="`page-${page}`" size="12">
                        <div class="word-wrapper" v-for="verse in verses" :key="verse.id"
                            :id="`line-${verse.verse_number}`" :data-hizb-number="verse.hizb_number"
                            :data-chapter-id="verse.chapter_id" :data-juz-number="verse.juz_number"
                            :data-page-number="page" :data-verse-number="verse.verse_number">
                            <span v-for="word in verse.words" :key="word.id" :data-word-position="word.position"
                                class="" :data-hizb-number="verse.hizb_number" :data-juz-number="verse.juz_number"
                                :data-chapter-id="verse.chapter_id" :data-page-number="page">
                                <ion-text :color="isWordHighlighted(word) ? styles.color : ''" class="word">
                                    <div v-if="word.char_type_name === 'end'" class="end">
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
                    <!-- </ion-row>
                    </ion-grid> -->

                </ion-card-content>
            </ion-card>
            <ion-infinite-scroll @ion-infinite="ionInfinite">
                <ion-infinite-scroll-content loading-text="Please wait..."
                    loading-spinner="bubbles"></ion-infinite-scroll-content>
            </ion-infinite-scroll>
        </ion-content>
    </div>
</template>