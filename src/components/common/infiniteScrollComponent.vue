<script setup lang="ts">
import { IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/vue';
//composables
import { useLocale } from '@/composables/useLocale';
// type
import type { InfiniteScrollCustomEvent } from '@ionic/vue';

const { getLine } = useLocale()
defineProps<{
    id: string;
    length?: number
    totalVersesCount?: number
}>()

defineEmits<{
    "update:scroll": [value: InfiniteScrollCustomEvent]
}>()
</script>
<template>
    <ion-infinite-scroll @ion-infinite="$emit('update:scroll', $event)" :id="id"
        :disabled="length === totalVersesCount">
        <ion-infinite-scroll-content v-if="length !== totalVersesCount" loading-spinner="bubbles"
            :loading-text="getLine('text.loadingMoreVerses')"></ion-infinite-scroll-content>
    </ion-infinite-scroll>
</template>