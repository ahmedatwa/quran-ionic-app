<script lang="ts" setup>
import { ref } from "vue"
import { IonActionSheet } from '@ionic/vue';
// types
import type { Verse } from "@/types/verse";

const isCopied = ref(false)
const props = defineProps<{
    verse: Verse
    triggerProp: string
    actionSheetButtonsProps?: { text: string, role: string }[]
}>()

const emit = defineEmits<{
    'update:didDismiss': [value: any]
    "update:playVerseAudio": [value: { audioID: number, verseKey: string }]
    "update:bookmarked": [value: number]
}>()


const actionSheetButtons = [
    {
        text: 'Play',
        role: "play",
    },
    {
        text: 'Copy',
        role: 'copy',
    },
    {
        text: 'Bookmark',
        role: 'bookmark',
    },
    {
        text: 'Cancel',
        role: 'cancel',
    }
];

const handleDismiss = (ev: CustomEvent) => {
    const role = ev.detail.role
    switch (role) {
        case "play":
            emit('update:playVerseAudio', { audioID: props.verse.chapter_id, verseKey: props.verse.verse_key })
            break;
        case "copy":
            copyText(props.verse.text_uthmani)
            break;
        case "bookmark":
            emit('update:bookmarked', props.verse.verse_number)
            break;
    }
}

const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    isCopied.value = true
}

</script>

<template>
    <div class="container">
        <ion-action-sheet :trigger="triggerProp" :header="`Verse ${verse.verse_key}`" :buttons="actionSheetButtons"
            @didDismiss="$emit('update:didDismiss', $event)" @did-dismiss="handleDismiss($event)"></ion-action-sheet>
    </div>
</template>
