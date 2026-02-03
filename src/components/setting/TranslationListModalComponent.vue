<script setup lang="ts">
import { onMounted, shallowRef } from "vue"
import { IonModal, IonIcon, IonLabel, IonButton } from "@ionic/vue";
import { IonItem, IonToolbar, IonContent, IonHeader, IonTitle, IonButtons } from '@ionic/vue';
import { IonAccordion, IonAccordionGroup } from "@ionic/vue"
// icons
import { chevronDownOutline, checkmarkOutline, language } from "ionicons/icons";
// types
import type { Translation, TranslationReduceMap } from "@/types/translations";
// utils
import { upperCase } from "@/utils/string";
// composables
import { useStorage } from "@/composables/useStorage";
import { useLocale } from "@/composables/useLocale";

const translationsModalRef = shallowRef()
const { getStorage } = useStorage("__settingsDB")
const selectedTranslationLanguage = shallowRef("")
const { getLine } = useLocale()

defineProps<{
    trigger: string
    translationsMap?: TranslationReduceMap
    selectedTranslation?: Translation
}>()

const emit = defineEmits<{
    "update:selectedTranslation": [value: Translation]
    "update:modalDismissed": [value: boolean]
}>()

const dismiss = () => translationsModalRef.value.$el.dismiss(null, 'cancel');

const handleSelectedTranslation = (value: Translation) => {
    emit("update:selectedTranslation", value)
    selectedTranslationLanguage.value = value.language_name
    dismiss()
}

onMounted(async () => {
    await getStorage("translation").then((resource) => {
        selectedTranslationLanguage.value = (JSON.parse(resource) as Translation).language_name
    })

})

</script>
<template>
    <ion-modal ref="translationsModalRef" :trigger="trigger" :can-dismiss="true"
        @ion-modal-did-dismiss="$emit('update:modalDismissed', true)">
        <ion-header>
            <ion-toolbar>
                <ion-title><ion-icon :icon="language"></ion-icon>{{ getLine('settings.translations') }}</ion-title>
                <ion-buttons slot="start">
                    <ion-button @click="dismiss" color="medium">
                        <ion-icon :icon="chevronDownOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-accordion-group :value="selectedTranslationLanguage">
                <ion-accordion :value="String(type)" v-for="(items, type, index) in translationsMap" :key="index">
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
        </ion-content>
    </ion-modal>
</template>
