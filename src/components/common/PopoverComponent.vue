<script setup lang="ts">
import { watch } from "vue"
import { IonContent, IonPopover } from '@ionic/vue';

const props = defineProps<{
    trigger: string
    content: string
    isOpen?: boolean
}>()

defineEmits<{
    "update:modelValue": [value: boolean]
}>()


watch(() => props.isOpen, (open) => {
    if (open) {

    }
})
</script>
<template>
    <ion-popover :trigger="trigger" :is-open="isOpen" @didDismiss="$emit('update:modelValue', false)"
        :show-backdrop="false" side="top" trigger-action="click">
        <ion-content class="ion-padding">{{ content }}</ion-content>
    </ion-popover>
</template>