<script setup lang="ts">
import { onMounted, shallowRef } from "vue"
import { IonModal, IonIcon, IonLabel, IonButton } from "@ionic/vue";
import { IonItem, IonToolbar, IonContent, IonHeader, IonTitle, IonButtons } from '@ionic/vue';
import { IonAccordion, IonAccordionGroup } from "@ionic/vue"
// icons
import { chevronDownOutline, checkmarkOutline, mic } from "ionicons/icons";
// types
import type { Recitations, MapRecitions } from "@/types/audio";
// utils
import { upperCase } from "@/utils/string";
// composables
import { useStorage } from "@/composables/useStorage";
import { useLocale } from "@/composables/useLocale";

const modalRef = shallowRef()
const { getLine } = useLocale()
const { getStorage } = useStorage("__settingsDB")
const selectedRecitionStyleName = shallowRef("")

defineProps<{
    trigger: string
    mapRecitions?: MapRecitions
    selectedReciter?: Recitations
    initialBreakpoint?: string
    breakpoints?: number[]
    backdropBreakpoint?: number
}>()

const emit = defineEmits<{
    "update:selectedRecition": [value: Recitations]
    "update:modalDismissed": [value: boolean]
}>()

const dismiss = () => modalRef.value.$el.dismiss(null, 'cancel');

const handleSelectedRecition = (value: Recitations) => {
    emit("update:selectedRecition", value)
    selectedRecitionStyleName.value = value.style.name
    dismiss()
}

onMounted(async () => {
    await getStorage("reciter").then((resource) => {
        selectedRecitionStyleName.value = (JSON.parse(resource) as Recitations).style.name
    })
})

</script>
<template>
    <ion-modal ref="modalRef" :trigger="trigger" :can-dismiss="true" :initial-breakpoint="initialBreakpoint"
        :breakpoints="breakpoints" @ion-modal-did-dismiss="$emit('update:modalDismissed', true)">
        <ion-header>
            <ion-toolbar>
                <ion-title><ion-icon :icon="mic"></ion-icon>{{ getLine('settings.reciters') }}</ion-title>
                <ion-buttons slot="start">
                    <ion-button @click="dismiss" color="medium">
                        <ion-icon :icon="chevronDownOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-accordion-group :value="selectedRecitionStyleName">
                <ion-accordion :value="String(type)" v-for="(items, type, index) in mapRecitions" :key="index">
                    <ion-item slot="header" color="light">
                        <ion-label>{{ upperCase(type) }}</ion-label>
                    </ion-item>
                    <div class="ion-padding" slot="content" v-for="item in items" :key="item.id"
                        @click="handleSelectedRecition(item)">
                        <ion-icon v-if="item?.id === selectedReciter?.id" :icon="checkmarkOutline"
                            color="primary"></ion-icon>
                        <ion-label>{{ item.name }}</ion-label>
                    </div>
                </ion-accordion>
            </ion-accordion-group>
        </ion-content>
    </ion-modal>
</template>
<style scoped></style>