<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/vue';
import { IonButtons, IonButton, IonModal, IonText, IonIcon } from '@ionic/vue';
import type { ChapterInfo } from '@/types/chapter';
import { useChapterStore } from '@/stores/ChapterStore';
import { chevronDownOutline } from 'ionicons/icons';

const modal = ref();
const { getChapter } = useChapterStore()
const chapterName = ref("")
const dismiss = () => {
    modal.value.$el.dismiss()
}

const props = defineProps<{
    pageEl?: HTMLElement
    trigger: string
    chapterInfo?: ChapterInfo | null
}>()

watchEffect(() => {
    if (props.chapterInfo) {
        const chapter = getChapter(props.chapterInfo.chapter_id)
        if (chapter) chapterName.value = chapter?.nameSimple
    }
})
</script>

<template>
    <ion-modal ref="modal" :trigger="trigger" :can-dismiss="true">
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ chapterName }}</ion-title>
                <ion-buttons slot="start">
                    <ion-button @click="dismiss" color="medium">
                    <ion-icon :icon="chevronDownOutline"></ion-icon>
                </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <div v-if="chapterInfo">
                <ion-text v-html="chapterInfo?.text"></ion-text>
            </div>
        </ion-content>
    </ion-modal>
</template>
