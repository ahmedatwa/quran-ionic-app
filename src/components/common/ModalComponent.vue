<script setup lang="ts">
import { ref } from "vue"
import { IonModal, IonIcon, IonList, IonLabel, IonListHeader, IonButton } from "@ionic/vue";
import { IonItem, IonToolbar, IonContent, IonHeader, IonTitle, IonButtons } from '@ionic/vue';
// icons
import { chevronDownOutline, checkmarkOutline } from "ionicons/icons";
// types
import type { Recitations, MapRecitions } from "@/types/audio";
import type { Translation, TranslationReduceMap } from "@/types/translations";
// utils
import { upperCase } from "@/utils/string";

const modal = ref()

const props = defineProps<{
    title: string;
    trigger: string
    data?: TranslationReduceMap | MapRecitions
    selected?: Translation | Recitations
}>()

const emit = defineEmits<{
    "update:selectedRecition": [value: Recitations]
    "update:selectedTranslation": [value: Translation]
}>()


const dimiss = () => modal.value.$el.dismiss(null, 'cancel');

const handleSelectedRecition = (value: Recitations) => {
    emit("update:selectedRecition", value)
    dimiss()
}

const handleSelectedTranslation = (value: Translation) => {
    emit("update:selectedTranslation", value)
    dimiss()
}

const recitionsData = ref<MapRecitions>()
const translationsData = ref<TranslationReduceMap>()
const selectedReciter = ref<Recitations>()
const selectedTranslation = ref<Translation>()

const handleData = () => {
    if (props.trigger === "reciters-modal") {
        recitionsData.value = props.data as MapRecitions
        selectedReciter.value = props.selected as Recitations
    } else {
        translationsData.value = props.data as TranslationReduceMap
        selectedTranslation.value = props.selected as Translation
    }
}

</script>
<template>
    <ion-modal ref="modal" :trigger="trigger" :can-dismiss="true" @ionModalWillPresent="handleData">
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ title }}</ion-title>
                <ion-buttons slot="start">
                    <ion-button @click="dimiss" color="medium">
                        <ion-icon :icon="chevronDownOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <div v-if="recitionsData">
                <ion-list v-for="(items, index) in recitionsData" :key="index">
                    <ion-list-header> {{ upperCase(index) }} </ion-list-header>
                    <ion-item button v-for="item in items" :key="item.id" @click="handleSelectedRecition(item)">
                        <ion-icon v-if="item?.id === selectedReciter?.id" 
                            :icon="checkmarkOutline" color="primary"></ion-icon>
                        <ion-label>{{ item.name }}</ion-label>
                    </ion-item>
                </ion-list>
            </div>
            <div v-else>
                <ion-list v-for="(items, index) in translationsData" :key="index">
                    <ion-list-header> {{ upperCase(index) }} </ion-list-header>
                    <ion-item button v-for="item in items" :key="item.id" @click="handleSelectedTranslation(item)">
                        <ion-icon v-if="item.id === selectedTranslation?.id" 
                            :icon="checkmarkOutline" color="primary"></ion-icon>
                        <ion-label>{{ item.author_name }}</ion-label>
                    </ion-item>
                </ion-list>
            </div>
        </ion-content>
    </ion-modal>
</template>
