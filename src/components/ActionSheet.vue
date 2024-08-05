<script lang="ts" setup>
import { IonActionSheet } from '@ionic/vue';

const props = defineProps<{
    triggerProp: string
    headerProp: string
    actionSheetButtonsProps?: { text: string, role: string }[]
}>()

defineEmits<{
    'update:didDismiss': [value: any]
}>()


const actionSheetButtons = [
    {
        text: 'Play',
        role: "playaudio",
        data: {
            action: 'playAudio',
        },
    },
    {
        text: 'Copy',
        role: 'copy',
        data: {
            action: 'copy',
        },
    },
    {
        text: 'Bookmark',
        role: 'bookmark',
        data: {
            action: 'bookmark',
        },
    },
    {
        text: 'Cancel',
        role: 'cancel',
        data: {
            action: 'cancel',
        },
    }
];

</script>

<template>
    <div class="container">
        <ion-action-sheet :trigger="triggerProp" :header="`Verse ${headerProp}`" :buttons="actionSheetButtons"
            @didDismiss="$emit('update:didDismiss', $event)"></ion-action-sheet>
    </div>
</template>
