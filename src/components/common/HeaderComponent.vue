<script setup lang="ts">
import { onUnmounted } from "vue"
import { IonHeader, IonToolbar, IonTitle, IonSearchbar, IonProgressBar } from "@ionic/vue";
import { IonIcon, toastController, IonLabel } from "@ionic/vue";
// icons
import { documentOutline, cogOutline, bookOutline, newspaperOutline } from 'ionicons/icons';
import { Network } from '@capacitor/network';

defineProps<{
    title: string
    isLoading?: boolean
    search: boolean;
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

Network.addListener('networkStatusChange', status => {
    if (!status.connected) {
        presentToast(`Network connnection lost`);
    } else {
        presentToast(`Network connnection restored`);
    }
});


onUnmounted(() => Network.removeAllListeners())

const presentToast = async (message: string) => {
    const toast = await toastController.create({
        message,
        duration: 1500,
        position: "top",
        id: 'network-toast'
    });

    await toast.present();
}

</script>
<template>
    <ion-header :translucent="translucent" :collapse="collapse">
        <ion-toolbar>
            <ion-title size="large" class="ion-margin">
                <ion-icon :icon="icon" size="large" class="icon-title"></ion-icon>
                <ion-label>{{ title }}</ion-label>
            </ion-title>
        </ion-toolbar>
        <ion-toolbar v-if="search">
            <ion-searchbar @ionInput="handleInput"></ion-searchbar>
            <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
        </ion-toolbar>
    </ion-header>
</template>