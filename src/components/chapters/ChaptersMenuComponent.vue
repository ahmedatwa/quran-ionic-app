<script setup lang="ts">
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonSearchbar, IonButton, menuController } from '@ionic/vue';
import { IonLabel, IonNote, IonContent, IonList, IonItem, IonMenuToggle, IonIcon } from '@ionic/vue';
import { closeCircleOutline, bookOutline } from 'ionicons/icons';
import { localizeNumber } from '@/utils/number';
import { useLocale } from '@/utils/useLocale';
import type { Chapter } from '@/types/chapter';

const { getLocale, isRtl } = useLocale()

defineProps<{
    contentId?: string
    menuId?: string
    selectedChapter: Chapter | null
    chapters?: Chapter[]
}>()

const emit = defineEmits<{
    "update:searchChapters": [value: string]
    "update:selectedChapter": [value: Chapter]
}>()
const handleInput = (event: Event) => {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    emit("update:searchChapters", query)
}

const getSelectedChapter = (chapter: Chapter) => {
    emit("update:selectedChapter", chapter)
}

const closeMenu = () => {
    menuController.close()
}
</script>
<template>
    <ion-menu content-id="chapters-content" type="push" :swipe-gesture="true">
        <ion-header>
            <ion-toolbar>
                
                <ion-title >
                    
                    Chapters</ion-title>
            </ion-toolbar>
            <ion-searchbar placeholder="Chapters" @ionInput="handleInput($event)"></ion-searchbar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item button detail v-for="chapter in chapters" :key="chapter.id"
                    @click="getSelectedChapter(chapter)">
                    <ion-label> <span v-if="isRtl">{{ localizeNumber(chapter.id, getLocale) }}-
                            {{ chapter.nameArabic }}</span>
                        <span v-else>{{ chapter.id }}- {{ chapter.nameSimple }}</span></ion-label>
                    <ion-note slot="end">{{ chapter.versesCount }}</ion-note>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-menu>
</template>
