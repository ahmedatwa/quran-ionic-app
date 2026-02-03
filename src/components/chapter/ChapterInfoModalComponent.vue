<script lang="ts" setup>
import { onBeforeMount, shallowRef } from 'vue';
import { IonContent, IonHeader, IonToolbar, IonTitle, modalController } from '@ionic/vue';
import { IonButtons, IonButton, IonText, IonIcon } from '@ionic/vue';
import { chevronDownOutline } from 'ionicons/icons';
// type
import type { ChapterInfo } from '@/types/chapter';
// stores
import { useChapterStore } from '@/stores/ChapterStore';
// utils
import { getChapterInfoByChapterId } from '@/utils/chapter';

const chapterInfo = shallowRef<ChapterInfo>()
const chapterName = shallowRef<string | undefined>()
const { getChapterById } = useChapterStore()

const dismiss = () => modalController.dismiss(null, 'cancel')

const props = defineProps<{
    chapterId: number
    pageEl?: HTMLElement
}>()


onBeforeMount(async () => {
    if (props.chapterId) {
        const [info, name] = await Promise.all([
            getChapterInfoByChapterId(props.chapterId.toString()),
            getChapterById(props.chapterId)
        ])

        chapterInfo.value = info
        chapterName.value = name?.nameSimple
    }
})

</script>

<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-button @click="dismiss" color="medium">
                    <ion-icon :icon="chevronDownOutline"></ion-icon>
                </ion-button>
            </ion-buttons>
            <ion-title>{{ chapterName }}</ion-title>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <div v-if="chapterInfo">
            <ion-text v-html="chapterInfo?.text"></ion-text>
        </div>
    </ion-content>
</template>
