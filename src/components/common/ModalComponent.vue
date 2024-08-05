<script setup lang="ts">
import { ref } from "vue"
import { IonButtons, IonButton, IonModal, IonHeader, IonContent } from "@ionic/vue";
import { IonToolbar, IonTitle, IonPage, IonIcon } from "@ionic/vue";
import SettingsTab from "@/views/SettingsTab.vue";
import { removeOutline } from "ionicons/icons";

const page = ref(null);
const modal = ref(null);
const presentingElement = ref()

defineProps<{
    modalTitle: string
    trigger: string
}>()

defineEmits<{
    "update:modelValue": [value: boolean]
}>()


</script>
<template>
    <ion-page ref="page">
        <ion-content class="ion-padding">
            <ion-header>
                <ion-toolbar>
                    <ion-title>
                        <ion-icon :icon="removeOutline" color="primary"></ion-icon>
                    </ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-modal ref="modal" :trigger="trigger"  >
                <ion-content>
                    <settings-tab></settings-tab>
                </ion-content>
            </ion-modal>
        </ion-content>
    </ion-page>
</template>
