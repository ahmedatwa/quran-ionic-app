<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { IonContent, IonHeader, IonSegmentButton } from '@ionic/vue';
import { IonToolbar, IonSegment, IonLabel, IonPage } from '@ionic/vue';
// components
import TranslationsComponent from "@/components/chapters/TranslationsComponent.vue";
import ReadingComponent from '@/components/chapters/ReadingComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import { useRoute } from 'vue-router';
// stores
import { useChapterStore } from "@/stores/ChapterStore"
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";

const currentSegment = ref("translations")
const chapterStore = useChapterStore()
const { getAudio } = useAudioPlayerStore()

const audioModelValue = ref(false)

const handleSegmentChange = (ev: CustomEvent) => {
    currentSegment.value = ev.detail.value

}
const router = useRoute()
const { chapterId } = router.params

watchEffect(async () => {
    if (chapterId) {
        chapterStore.selectedChapter = null
        const found = chapterStore.chaptersList.find((c) => c.id === Number(chapterId))
        if (found) {
            if (!found.verses?.length) {
                await chapterStore.getVerses(found.id, true)
            } else {
                chapterStore.selectedChapter = found
            }

        }
    }
})

const defaultStyles = ref({
    fontFamily: "var(--font-family-noto-kufi)",
    fontSize: "var(--font-size-1)",
    fontWeight: "var(--font-weight-normal)"
})

const playAudio = async (event: { audioID: number, verseKey?: string }) => {
    await getAudio({ audioID: event.audioID, verseKey: event.verseKey })
    audioModelValue.value = true
}
</script>


<template>
    <ion-page :data-chapter-id="chapterId">
        <ion-header>
            <ion-toolbar>
                <ion-segment :value="currentSegment" @ion-change="handleSegmentChange">
                    <ion-segment-button value="translations">
                        <ion-label>Translations</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="reading">
                        <ion-label>Reading</ion-label>
                    </ion-segment-button>
                </ion-segment>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <translations-component :is-translations-view="currentSegment === 'translations'"
                :default-styles="defaultStyles" @update:play-audio="playAudio"></translations-component>
            <reading-component :is-reading-view="currentSegment === 'reading'" :default-styles="defaultStyles"
                @update:play-audio="playAudio"></reading-component>
        </ion-content>
        <audio-player-component :model-value="audioModelValue" @update:model-value="audioModelValue = $event">
        </audio-player-component>
    </ion-page>
</template>