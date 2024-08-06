<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { IonContent, IonHeader, IonSegmentButton } from '@ionic/vue';
import { IonToolbar, IonSegment, IonLabel, IonPage } from '@ionic/vue';
// components
import TranslationsComponent from "@/components/juzs/TranslationsComponent.vue";
import ReadingComponent from '@/components/juzs/ReadingComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import { useRoute } from 'vue-router';
// stores
import { useJuzStore } from "@/stores/JuzStore"
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";

const currentSegment = ref("translations")
const juzStore = useJuzStore()
const { getAudio } = useAudioPlayerStore()
const audioModelValue = ref(false)
const handleSegmentChange = (ev: CustomEvent) => {
    currentSegment.value = ev.detail.value

}
const router = useRoute()
const { juzId } = router.params

watchEffect(async () => {
    if (juzId) {
        juzStore.selectedJuz = null
        const found = juzStore.juzList.find((j) => j.juz_number === Number(juzId))
        if (found) {
            if (!found.verses?.length) {
                await juzStore.getVerses(found.id, true)
            } else {
                juzStore.selectedJuz = found
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
    <ion-page :data-juz-id="juzId">
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
                :default-styles="defaultStyles"></translations-component>
            <reading-component :is-reading-view="currentSegment === 'reading'"
                :default-styles="defaultStyles"></reading-component>
        </ion-content>
        <audio-player-component :model-value="audioModelValue" @update:model-value="audioModelValue = $event">
        </audio-player-component>
    </ion-page>
</template>