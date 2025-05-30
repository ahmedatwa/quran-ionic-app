<script setup lang="ts">
import { IonRow, IonCol, IonListHeader, IonIcon, IonItemOptions, IonSpinner } from '@ionic/vue';
import { IonItem, IonLabel, IonList, IonItemSliding, IonItemOption } from '@ionic/vue';
import { leafOutline, playCircleOutline, downloadOutline } from 'ionicons/icons';
// types
import type { Chapter } from '@/types/chapter';
// composables
import { useLocale } from "@/composables/useLocale";

const { getLine, isRtl } = useLocale()

const props = defineProps<{
    recentlyPlayed?: Chapter[],
    chapterId?: number,
    isPlaying: boolean,
    audioId?: number
}>()

defineEmits<{
    "update:download": [value: string | number]
    "update:playChapter": [value: number]
}>()

const isPlayable = (chapterId: number) => {
    if (props.chapterId)
        return props.chapterId === chapterId
}

const isAudioPlaying = (chapterId: number) => {
    return props.isPlaying && (chapterId === props.audioId)
}

</script>
<template>
    <ion-row class="ion-justify-content-center ion-margin-vertical" v-if="recentlyPlayed" style="height: 300px; overflow-y: scroll;">
        <ion-col size="12">
            <ion-list-header class="ion-margin-bottom">
                <ion-icon :icon="leafOutline" style="margin-right: 5px;"></ion-icon> {{
                    getLine('audio.recentlyPlayed') }}
            </ion-list-header>
            <ion-list style="height: auto; overflow-y: scroll;">
                <ion-item-sliding v-for="chapter in recentlyPlayed" :key="chapter.id">
                    <ion-item :button="true">
                        <ion-spinner name="dots" color="danger" class="ml-1" v-if="isAudioPlaying(chapter.id)"></ion-spinner>
                        <ion-label>
                            <h3>
                                <span v-if="isRtl">{{ chapter.nameArabic }}</span>
                                <span v-else>{{ chapter.nameSimple }}</span>
                            </h3>

                        </ion-label>
                    </ion-item>
                    <ion-item-options slot="end">
                        <ion-item-option @click="$emit('update:download', chapter.id)" color="warning">
                            <ion-icon slot="icon-only" :icon="downloadOutline"></ion-icon>
                        </ion-item-option>
                        <ion-item-option :disabled="isPlayable(chapter.id)"
                            @click="$emit('update:playChapter', chapter.id)">
                            <ion-icon slot="icon-only" :icon="playCircleOutline"></ion-icon>
                        </ion-item-option>
                    </ion-item-options>
                </ion-item-sliding>
            </ion-list>
        </ion-col>
    </ion-row>
</template>