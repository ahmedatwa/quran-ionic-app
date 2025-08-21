<script setup lang="ts">
import { IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/vue';
import type { InfiniteScrollCustomEvent } from '@ionic/vue';

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
    <div v-if="length !== totalVersesCount">
         <ion-infinite-scroll @ion-infinite="$emit('update:scroll', $event)" :id="id">
            <ion-infinite-scroll-content loading-text="Please wait..."
                loading-spinner="bubbles"></ion-infinite-scroll-content>
        </ion-infinite-scroll>
    </div>
</template>