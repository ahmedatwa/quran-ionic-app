<script setup lang="ts">
import { computed } from "vue";
import { IonButton, IonIcon, IonLabel } from "@ionic/vue";
// ionicons
import { chevronForwardCircleOutline } from "ionicons/icons";
// utils
import { DEFAULT_NUMBER_OF_PAGES } from "@/utils/pages"
//composables
import { useLocale } from "@/composables/useLocale";

const { getLine } = useLocale()

const props = defineProps<{
    pageId: number
}>()

const isDisabled = computed(() => props.pageId === DEFAULT_NUMBER_OF_PAGES)
const nextPage = computed(() => props.pageId + 1)

</script>
<template>
    <ion-button size="small" fill="clear" :disabled="isDisabled" class="ion-float-right"
        :router-link="`/page/${nextPage}`">
        <ion-icon slot="end" :icon="chevronForwardCircleOutline"></ion-icon>
        <ion-label>{{ getLine('quranReader.nextPage') }}</ion-label>
    </ion-button>
</template>