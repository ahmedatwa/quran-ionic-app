<script setup lang="ts">
import { IonHeader, IonSegment, IonSegmentButton } from '@ionic/vue';
import { IonLabel, IonToolbar } from '@ionic/vue';
import { useLocale } from '@/utils/useLocale';

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