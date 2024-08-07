<script setup lang="ts">
import { onMounted, onUnmounted, ref, Ref } from "vue"
import { IonModal, IonIcon, IonPage, IonList, IonLabel, IonListHeader } from "@ionic/vue";
import { IonItem, IonToolbar, IonContent, IonHeader, IonButton } from '@ionic/vue';
// icons
import { checkmarkCircleOutline, removeOutline } from "ionicons/icons";
// types
import { mapRecitions, Recitations } from "@/types/audio";

const modal = ref()
const pageRef = ref()

const props = defineProps<{
    trigger: string
    recitations: mapRecitions[] | undefined
    selectedReciter: Recitations
    presentingElement: Ref<typeof IonPage> | null
}>()

const emit = defineEmits<{
    "update:selectedReciter": [value: Recitations]
}>()

onMounted(() => pageRef.value = props.presentingElement)
onUnmounted(() => modal.value.$el.dismiss())

const handleSelectedReciter = (reciter: Recitations) => {
    emit("update:selectedReciter", reciter)
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
            <ion-list v-for="(reciters, style) in recitations" :key="style">

                <ion-list-header> {{ style }} </ion-list-header>
                <ion-item button v-for="reciter in reciters" :key="reciter.id" @click="handleSelectedReciter(reciter)">
                    <ion-icon v-if="selectedReciter.id === reciter.id" slot="icon-only" :icon="checkmarkCircleOutline"
                        color="primary"></ion-icon>
                    <ion-label>{{ reciter.name }}</ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-modal>
</template>
