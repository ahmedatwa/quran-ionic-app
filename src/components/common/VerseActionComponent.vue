<script lang="ts" setup>
import { IonActionSheet, IonButton, IonIcon } from '@ionic/vue';
import { Clipboard } from '@capacitor/clipboard';
import { ellipsisVerticalOutline } from 'ionicons/icons';

// composables
import { useLocale } from '@/composables/useLocale';
import { useAlert } from '@/composables/useAlert';
// types
import type { Verse, VerseBookmarkValue } from "@/types/verse";
// stores
import { useChapterStore } from '@/stores/ChapterStore';

const { getLine } = useLocale()
const { presentToast } = useAlert()
const { getChapterNameByChapterId } = useChapterStore()

const props = defineProps<{
    pathId?: number
    verse: Verse
    id: string
    actionSheetButtonsProps?: { text: string, role: string }[]
}>()

const emit = defineEmits<{
    'update:didDismiss': [value: any]
    "update:playVerseAudio": [value: { audioID: number, verseKey: string }]
    "update:bookmarked": [value: { path: string, verse: VerseBookmarkValue }]
}>()

const actionSheetButtons = [
    {
        text: getLine("buttons.play"),
        role: "play",
    },
    {
        text: getLine("buttons.copy"),
        role: 'copy',
        htmlAttributes: {
            'aria-label': 'copy',
        },
    },
    {
        text: getLine("buttons.bookmark"),
        role: 'bookmark',
        htmlAttributes: {
            'aria-label': 'bookmark',
        },
    },
    {
        text: getLine("buttons.cancel"),
        role: 'cancel',
        htmlAttributes: {
            'aria-label': 'cancel',
        },
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
            const name = getChapterNameByChapterId(props.verse.chapter_id)
            emit('update:bookmarked', {
                path: `/page/${props.pathId}`,
                verse: {
                    chapterId: props.verse.chapter_id,
                    pageNumber: props.verse.page_number,
                    verseKey: props.verse.verse_key,
                    chapterName: name?.nameSimple,
                    verseNumber: props.verse.verse_number,
                    verseText: props.verse.text_uthmani,
                }
            })
            break;
    }
}

const copyText = async (text: string) => {
    await Promise.all([
        Clipboard.write({ string: text }),
        presentToast({
            id: "text-copy-success-alert",
            header: getLine('text.success'),
            message: getLine('text.copySuccess'),
            duration: 1000,
            color: "success"
        })
    ])
}

</script>
<template>
    <div v-if="id">
        <ion-button :aria-label="id" size="small" :id="id" fill="clear">
            <ion-icon :icon="ellipsisVerticalOutline" color="primary" slot="icon-only" aria-hidden="true">
            </ion-icon>
        </ion-button>
        <ion-action-sheet :trigger="id" :header="`Verse ${verse.verse_key}`" :buttons="actionSheetButtons"
            @did-dismiss="handleDismiss($event)" :key="id" :id="id"></ion-action-sheet>
    </div>
</template>
