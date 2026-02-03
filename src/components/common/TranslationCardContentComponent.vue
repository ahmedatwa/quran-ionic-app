<script setup lang="ts">
import { IonNote, IonText, } from '@ionic/vue';
// type
import type { VerseTranslation } from '@/types/verse';
import type { ComputedTranslationCSSReturn } from "@/types/settings";


defineProps<{
    translations?: VerseTranslation[]
    selectedTranslationId?: number
    translationStyles?: ComputedTranslationCSSReturn

}>()


</script>

<template>
    <ion-note v-for="translation in translations" :key="translation.id" class="translation">
        <ion-text v-if="selectedTranslationId === translation.resource_id" :style="translationStyles">
            <span v-html="translation.text"></span>
        </ion-text>
    </ion-note>

</template>