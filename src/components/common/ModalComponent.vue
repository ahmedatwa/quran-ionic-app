<script setup lang="ts">
import { onMounted, ref } from "vue"
import { IonModal, IonIcon, IonLabel, IonButton } from "@ionic/vue";
import { IonItem, IonToolbar, IonContent, IonHeader, IonTitle, IonButtons } from '@ionic/vue';
import { IonAccordion, IonAccordionGroup } from "@ionic/vue"
// icons
import { chevronDownOutline, checkmarkOutline } from "ionicons/icons";
// types
import type { Recitations, MapRecitions } from "@/types/audio";
import type { Translation, TranslationReduceMap } from "@/types/translations";
// utils
import { upperCase } from "@/utils/string";
import { useStorage } from "@/utils/useStorage";

const modal = ref()
const { getStorage } = useStorage("__settingsDB")
const selectedRecitionType = ref("")
const selectedTranslationType = ref("")
const recitionsData = ref<MapRecitions>()
const translationsData = ref<TranslationReduceMap>()
const selectedReciter = ref<Recitations>()
const selectedTranslation = ref<Translation>()

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


const dismiss = () => modal.value.$el.dismiss(null, 'cancel');

const handleSelectedRecition = (value: Recitations) => {
    emit("update:selectedRecition", value)
    selectedRecitionType.value = value.style.name
    dismiss()
}

const handleSelectedTranslation = (value: Translation) => {
    emit("update:selectedTranslation", value)
    selectedTranslationType.value = value.language_name
    dismiss()
}

const handleData = () => {
    if (props.trigger === "reciters-modal") {
        recitionsData.value = props.data as MapRecitions
        selectedReciter.value = props.selected as Recitations
    } else {
        translationsData.value = props.data as TranslationReduceMap
        selectedTranslation.value = props.selected as Translation
    }
}

onMounted(async () => {
    const reciter = await getStorage("reciter")
    if (reciter) {
        const parsed: Recitations = JSON.parse(reciter)        
        selectedRecitionType.value = parsed.style.name
    }

    const transaltion = await getStorage("transaltion")
    if (transaltion) {
        const parsed: Translation = JSON.parse(transaltion)
        selectedTranslationType.value = parsed.language_name
    }
})

</script>
<template>
    <ion-modal ref="modal" :trigger="trigger" :can-dismiss="true" @ionModalWillPresent="handleData">
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ title }}</ion-title>
                <ion-buttons slot="start">
                    <ion-button @click="dismiss" color="medium">
                        <ion-icon :icon="chevronDownOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <div v-if="recitionsData">
                <ion-accordion-group :value="selectedRecitionType">
                    <ion-accordion :value="String(type)" v-for="(items, type, index) in recitionsData" :key="index">
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
            </div>
            <div v-else>
                <ion-accordion-group :value="selectedTranslationType">
                    <ion-accordion :value="String(type)" v-for="(items, type, index) in translationsData" :key="index">
                        <ion-item slot="header" color="light">
                            <ion-label>{{ upperCase(type) }}</ion-label>
                        </ion-item>
                        <div class="ion-padding" slot="content" v-for="item in items" :key="item.id"
                            @click="handleSelectedTranslation(item)">
                            <ion-icon v-if="item.id === selectedTranslation?.id" :icon="checkmarkOutline"
                                color="primary"></ion-icon>
                            <ion-label>{{ item.author_name }}</ion-label>
                        </div>
                    </ion-accordion>
                </ion-accordion-group>
            </div>
        </ion-content>
    </ion-modal>
</template>
