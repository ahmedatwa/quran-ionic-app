<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle, IonSearchbar, IonProgressBar } from "@ionic/vue";
import { IonIcon } from "@ionic/vue";
// icons
import { documentOutline, cogOutline, bookOutline, newspaperOutline } from 'ionicons/icons';

defineProps<{
    title: string
    isLoading: boolean
    collapse?: "condense" | "fade"
    translucent?: boolean
    icon: typeof documentOutline | typeof bookOutline | typeof newspaperOutline | typeof cogOutline
}>()

const emit = defineEmits<{
    "update:searchValue": [value: string]
}>()

const handleInput = (ev: CustomEvent) => {
    emit("update:searchValue", ev.detail.value)

}
</script>
<template>
    <ion-header :translucent="translucent" :collapse="collapse">
        <ion-toolbar>
            <ion-title size="large" class="ion-margin">
                <ion-icon :icon="icon" size="large"></ion-icon> {{ title }}</ion-title>
        </ion-toolbar>
        <ion-toolbar>
            <ion-searchbar @ionInput="handleInput"></ion-searchbar>
            <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
        </ion-toolbar>
    </ion-header>
</template>
