<script setup lang="ts">
import { onMounted, onUnmounted, ref, Ref } from "vue"
import { IonModal, IonIcon, IonPage, IonList, IonLabel, IonListHeader } from "@ionic/vue";
import { IonItem, IonToolbar, IonContent, IonHeader } from '@ionic/vue';
// icons
import { checkmarkCircleOutline, removeOutline } from "ionicons/icons";
// types
import type { Translation, TranslationReduceMap } from "@/types/translations";
// utils
import { upperCase } from "@/utils/string";

const modal = ref()
const pageRef = ref()

const props = defineProps<{
    trigger: string
    selected: number[]
    translations: TranslationReduceMap | undefined
    presentingElement: Ref<typeof IonPage> | null
}>()

const emit = defineEmits<{
    "update:selected": [value: number]
}>()

onMounted(() => pageRef.value = props.presentingElement)
onUnmounted(() => modal.value.$el.dismiss())

const handleSelected = (value: number) => {
    emit("update:selected", value)
    modal.value.$el.dismiss()
}
</script>
<template>
    <ion-modal ref="modal" :trigger="trigger" :can-dismiss="true" :presenting-element="pageRef">
        <ion-header>
            <ion-toolbar class="ion-text-center">
                <ion-icon :icon="removeOutline" size="large"></ion-icon>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-list v-for="(translation, language) in translations" :key="language">
                <ion-list-header> {{ upperCase(language) }} </ion-list-header>
                <ion-item button v-for="item in translation" :key="item.id" @click="handleSelected(item.id)">
                    <ion-icon aria-hidden="true" :icon="checkmarkCircleOutline" slot="start" color="primary"
                        size="small" v-if="selected.includes(item.id)"></ion-icon>
                    <ion-label>{{ item.name }}</ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-modal>
</template>
