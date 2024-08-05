<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { IonContent, IonHeader, IonSegmentButton } from '@ionic/vue';
import { IonToolbar, IonSegment, IonLabel, IonPage } from '@ionic/vue';
// components
import TranslationsComponent from "@/components/juzs/TranslationsComponent.vue";
import ReadingComponent from '@/components/juzs/ReadingComponent.vue';
import { useRoute } from 'vue-router';
// stores
import { useJuzStore } from "@/stores/JuzStore"

const currentSegment = ref("translations")
const juzStore = useJuzStore()
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
            <translations-component :is-translations-view="currentSegment === 'translations'"></translations-component>
            <reading-component :is-reading-view="currentSegment === 'reading'"></reading-component>
        </ion-content>
    </ion-page>
</template>