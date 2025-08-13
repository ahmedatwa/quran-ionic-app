<script setup lang="ts">
import { IonSkeletonText, IonItem, IonLabel } from '@ionic/vue';

defineProps<{
    total: number
    loading: boolean
}>()
</script>
<template>
    <div v-if="loading">
        <ion-item v-for="t in total" :key="t">
            <ion-label>
                <h3>
                    <ion-skeleton-text :animated="true"></ion-skeleton-text>
                </h3>
                <p>
                    <ion-skeleton-text :animated="true" style="width: 80%;"></ion-skeleton-text>
                </p>
            </ion-label>
        </ion-item>
    </div>
</template>