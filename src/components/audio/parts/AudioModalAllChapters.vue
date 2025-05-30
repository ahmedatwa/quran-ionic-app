<script setup lang="ts">
import { IonRow, IonCol, IonListHeader, IonAccordion, IonAccordionGroup, IonIcon } from '@ionic/vue';
import { IonItem, IonLabel, IonList, IonItemSliding, IonItemOption, IonItemOptions } from '@ionic/vue';
import { musicalNote, downloadOutline, playCircleOutline } from 'ionicons/icons';
// types
import type { Juz } from '@/types/juz';
// composables
import { useLocale } from "@/composables/useLocale";

const { getLine, isRtl } = useLocale()

const props = defineProps<{
    juzs?: Juz[]
    chapterId?: number
}>()

defineEmits<{
    "update:download": [value: string | number]
    "update:playChapter": [value: number]
}>()

const isPlayable = (chapterId: number) => {
    if (props.chapterId)
        return props.chapterId === chapterId
}

</script>
<template>
    <ion-row class="ion-justify-content-center ion-margin-vertical">
        <ion-col size="12" style="height: 400px; overflow-y: scroll;">
            <ion-list-header class="ion-margin-bottom">
                <ion-icon :icon="musicalNote" style="margin-right: 5px;"></ion-icon> {{
                    getLine('audio.allChapters') }}
            </ion-list-header>
            <ion-accordion-group :value="'juz-1'">
                <ion-accordion v-for="juz in juzs" :key="juz.id" :value="`juz-${juz.id}`">
                    <ion-item slot="header" color="light">
                        <ion-label>{{ getLine('audio.juz', [juz.juz_number]) }}</ion-label>
                    </ion-item>
                    <div class="ion-padding" slot="content">
                        <ion-list>
                            <ion-item-sliding v-for="chapter in juz.chapters" :key="chapter.chapterId">
                                <ion-item>
                                    <ion-label>
                                        <span v-if="isRtl">{{ chapter.ar }}</span>
                                        <span v-else>{{ chapter.en }}</span>
                                    </ion-label>
                                </ion-item>
                                <ion-item-options slot="end">
                                    <ion-item-option color="warning"
                                        @click="$emit('update:download', Number(chapter.chapterId))">
                                        <ion-icon slot="icon-only" :icon="downloadOutline"></ion-icon>
                                    </ion-item-option>
                                    <ion-item-option @click="$emit('update:playChapter', Number(chapter.chapterId))"
                                        :disabled="isPlayable(Number(chapter.chapterId))">
                                        <ion-icon slot="icon-only" :icon="playCircleOutline"></ion-icon>
                                    </ion-item-option>
                                </ion-item-options>
                            </ion-item-sliding>
                        </ion-list>
                    </div>
                </ion-accordion>
            </ion-accordion-group>
        </ion-col>
    </ion-row>
</template>