<script lang="ts" setup>
import { computed, ref } from "vue"
// ionic
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/vue';
import { IonItemDivider, IonLabel, IonCardSubtitle, IonContent, IonIcon } from "@ionic/vue";
import { IonGrid, IonRow, IonCol, IonChip, IonToolbar, IonButton, IonButtons } from '@ionic/vue';
import { chevronBackOutline, pauseOutline, playOutline } from 'ionicons/icons';
// Types 
import type { MapVersesByPage } from "@/types/verse";
import { useLocale } from "@/utils/useLocale";
import { VerseTimingsProps, IsAudioPlayingProps } from "@/types/audio";
// stores
import { useChapterStore } from "@/stores/ChapterStore";
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";

const chapterStore = useChapterStore()
const audioPlayerStore = useAudioPlayerStore()
const audioModelValue = ref(false)

const { getLine } = useLocale()

const props = defineProps<{
    isReadingView: boolean
    verseTiming?: VerseTimingsProps
    isAudioPlaying?: IsAudioPlayingProps
    audioExperience?: { autoScroll: boolean; tooltip: boolean };
    defaultStyles: Record<"fontSize" | "fontFamily" | "fontWeight", string>
}>()

const verses = computed(() => {
    if (chapterStore.selectedChapterVerses) {
        return chapterStore.selectedChapterVerses.sort(
            (a, b) => a.verse_number - b.verse_number
        );
    }
});

const mapVersesByPage = computed((): MapVersesByPage | undefined => {
    if (verses.value) {
        return verses.value.reduce((acc: any, obj) => {
            (acc[obj.page_number] = acc[obj.page_number] || []).push(obj);
            return acc;
        }, {});
    }
});

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

const playAudio = () => {
    const audioID = chapterStore.selectedChapter?.id
    if (audioID) {
        audioPlayerStore.getAudio({ audioID })
    }
    audioModelValue.value = true
}

</script>

<template>
    <div class="ion-page" v-if="isReadingView">
        <ion-toolbar color="light">
            <ion-buttons slot="start">
                <ion-button :router-link="'/pages'" router-direction="back">
                    <ion-icon :icon="chevronBackOutline"></ion-icon>
                </ion-button>
            </ion-buttons>
            <ion-buttons slot="end">
                <ion-chip @click="playAudio" color="primary">
                    <ion-icon color="primary"
                        :icon="audioPlayerStore.isPlaying ? pauseOutline : playOutline"></ion-icon>
                    <ion-label>Play Audio</ion-label>
                </ion-chip>
            </ion-buttons>
        </ion-toolbar>
        <ion-content>
            <ion-card class="ion-padding">
                <ion-card-header class="ion-text-center">
                    <ion-card-subtitle>{{ chapterStore.selectedChapterBismillah }}</ion-card-subtitle>
                    <ion-card-title>{{ chapterStore.selectedChapter?.nameArabic }}</ion-card-title>
                </ion-card-header>
                <ion-card-content class="ion-padding quran-reader-content-wrapper">
                    <ion-grid>
                        <ion-row v-for="(verses, page) in mapVersesByPage" :key="page" :id="`row-page-${page}`"
                            class="">
                            <ion-col class="verse-col" :id="`page-${page}`" size="12">
                                <div class="word-wrapper" v-for="verse in verses" :key="verse.id"
                                    :id="`line-${verse.verse_number}`" :data-hizb-number="verse.hizb_number"
                                    :data-chapter-id="verse.chapter_id" :data-juz-number="verse.juz_number"
                                    :data-page-number="page" :data-verse-number="verse.verse_number">
                                    <h3 v-for="word in verse.words" :key="word.id" :data-word-position="word.position"
                                        class="flex" :data-hizb-number="verse.hizb_number"
                                        :data-juz-number="verse.juz_number" :data-chapter-id="verse.chapter_id"
                                        :data-page-number="page">
                                        <div :class="isWordHighlighted(word.location, word.verse_key)
                                            ? 'text-blue'
                                            : ''
                                            " class="word">
                                            <div v-if="word.char_type_name === 'end'">({{ word.text_uthmani }})
                                            </div>
                                            <div v-else>{{ word.text_uthmani }}</div>
                                        </div>
                                    </h3>
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
            </ion-card>
        </ion-content>
    </div>
</template>