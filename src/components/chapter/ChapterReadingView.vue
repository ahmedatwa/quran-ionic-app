<script lang="ts" setup>
import { ref, computed, watch, nextTick } from "vue"
import { IonCardContent, IonGrid, IonLabel } from "@ionic/vue";
import { IonRow, IonCol, IonItemDivider } from "@ionic/vue";
// composables
import { useScrollToElement } from "@/composables/useScrollToElement";
import { useLocale } from "@/composables/useLocale";
// stores
import { useVerseTimingStore } from "@/stores/VerseTimingStore";

// Types
import type { Verse, MapVersesByPage, VerseWord } from "@/types/verse"
import type { PlayAudioEmit, AudioPlayerSettings } from "@/types/audio";
import type { ComputedQuranCSSReturn } from "@/types/settings";

const cardRef = ref()
const intersectingVerseNumber = ref(1)
const { scrollToElement } = useScrollToElement()
const verseTimingStore = useVerseTimingStore()
const { getLine } = useLocale()

const props = defineProps<{
    cardId: string;
    contentId: string
    currentSegment: "translation" | "reading"
    chapterId: number
    audioSrc?: string
    audioExperience: AudioPlayerSettings;
    quranStyles: ComputedQuranCSSReturn
    isPlaying: boolean
    isLoading: boolean
    playbackSeeked?: number
    perPage: number
    verses?: Verse[]
    selectedTranslationId?: number
}>()

const emit = defineEmits<{
    "update:playAudio": [value: PlayAudioEmit];
    "update:loadingVerses": [value: boolean]

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
watch(() => verseTimingStore.verseTiming, (t) => {
    if (t?.verseNumber) {
        if (props.audioExperience) {
            if (props.audioExperience.autoScroll && props.isPlaying) {
                intersectingVerseNumber.value = t.verseNumber
            }
        }
    }
})

/**
 * handle auto scroll
 * base on local intersectingVerseNumber
 */
watch(intersectingVerseNumber, async (verseNumber) => {
    if (verseNumber) {
        await nextTick(async () => {
            await scroll(verseNumber)
            if (props.isLoading) {
                emit("update:loadingVerses", false)
            }
        })
    }
})



const scroll = (verseNumber: number) => scrollToElement(`#line-${verseNumber}`, props.cardId)
const isWordHighlighted = (word: VerseWord) => verseTimingStore.verseTiming?.wordLocation === word.location

</script>

<template>
    <ion-card-content class="ion-padding quran-reader-content-wrapper" :id="contentId">

        <ion-text v-for="(verses, index) in mapVersesByPage" :key="index" :id="`row-page-${index}`"
            class="">
            <ion-text class="" v-for="verse in verses" :key="verse.id" :id="`line-col-${verse.verse_number}`"
                :data-hizb-number="verse.hizb_number" :data-chapter-id="verse.chapter_id"
                :data-juz-number="verse.juz_number" :data-verse-number="verse.verse_number">

                <ion-text v-for="word in verse.words" :key="word.id" :data-word-position="word.position" class="  "
                    :id="`line-${verse.verse_number}`" :data-hizb-number="verse.hizb_number"
                    :data-juz-number="verse.juz_number" :data-chapter-id="verse.chapter_id" :data-page-number="index">
                    <ion-text :color="isWordHighlighted(word) ? quranStyles.wordColor : ''" class="word ion-float-end">
                        <h3 v-if="word.char_type_name === 'end'" class=" end">
                            ({{ word.text_uthmani }})
                        </h3>
                        <h3 :style="quranStyles" v-else>{{ word.text_uthmani }}</h3>
                    </ion-text>
                </ion-text>
            </ion-text>

            <ion-text class="ion-padding page-divider">
                <ion-label class="text"> {{ getLine("text.pageNumber", [String(index)]) }} </ion-label>
            </ion-text>
        </ion-text>

    </ion-card-content>
</template>
<style scoped>
ion-card-content {
    direction: rtl;
}

.height {
    height: 200px;
}

.full-flex {
    flex: 0 0 100%;
}
</style>