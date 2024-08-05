<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { IonContent, IonHeader, IonSegmentButton } from '@ionic/vue';
import { IonToolbar, IonSegment, IonLabel, IonPage } from '@ionic/vue';
// components
import TranslationsComponent from "@/components/pages/TranslationsComponent.vue";
import ReadingComponent from '@/components/pages/ReadingComponent.vue';
import { useRoute } from 'vue-router';
// stores
import { usePageStore } from "@/stores/PageStore"

const currentSegment = ref("translations")
const pageStore = usePageStore()
const handleSegmentChange = (ev: CustomEvent) => {
    currentSegment.value = ev.detail.value

}
const router = useRoute()
const { pageId } = router.params

watchEffect(async () => {
    if (pageId) {
        pageStore.selectedPage = null
        const found = pageStore.pagesList.find((p) => p.pageNumber === Number(pageId))
        if (found) {
            if (!found.verses?.length) {
                await pageStore.getVerses(found.pageNumber, true)
            } else {
                pageStore.selectedPage = found
            }

        }
    }
})
</script>


<template>
    <ion-page :data-page-id="pageId">
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