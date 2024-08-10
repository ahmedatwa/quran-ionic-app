<script lang="ts" setup>
import { IonToolbar, IonButton, IonButtons, IonIcon } from "@ionic/vue";
import { IonLabel, IonProgressBar } from "@ionic/vue";
import { chevronBackOutline, chevronForwardOutline } from "ionicons/icons";
import { useLocale } from "@/utils/useLocale"
import { useRouter } from "vue-router"


const { isRtl } = useLocale()
const { go } = useRouter()

defineProps<{
    routeBackLabel: string
    routerDirection?: "back" | "forward" | "root"
    routeBackPath?: string
    isLoading: boolean
}>()

</script>

<template>
    <ion-toolbar>
        <ion-buttons slot="start">
            <ion-button @click="routeBackPath ? routeBackPath : go(-1)"
                :router-direction="routerDirection ? routerDirection : 'back'" color="primary">
                <ion-icon :icon="isRtl ? chevronForwardOutline : chevronBackOutline"></ion-icon>
                <ion-label>{{ routeBackLabel }}</ion-label>
            </ion-button>
        </ion-buttons>
        <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
    </ion-toolbar>
</template>
