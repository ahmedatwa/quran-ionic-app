<script setup lang="ts">
import { IonHeader, IonSegment, IonSegmentButton } from '@ionic/vue';
import { IonLabel, IonToolbar, IonIcon } from '@ionic/vue';
import { home } from 'ionicons/icons';
// composables
import { useLocale } from '@/composables/useLocale';

const { getLine } = useLocale()

defineProps<{
    selectedSegment: string
}>()
const emit = defineEmits<{
    "update:selectedSegment": [value: string]
}>()

const handleSegmentChange = (ev: CustomEvent) => {
    emit('update:selectedSegment', ev.detail.value)
}

</script>

<template>
    <ion-header>
        <ion-toolbar>
            <ion-segment :value="selectedSegment" @ion-change="handleSegmentChange">
                <ion-segment-button value="home">
                    <ion-icon :icon="home"></ion-icon>
                </ion-segment-button>
                <ion-segment-button value="translations">
                    <ion-label>{{ getLine('tabs.translations') }}</ion-label>
                </ion-segment-button>
                <ion-segment-button value="reading">
                    <ion-label>{{ getLine('tabs.reading') }}</ion-label>
                </ion-segment-button>
            </ion-segment>
        </ion-toolbar>
    </ion-header>
</template>