<script setup lang="ts">
import { onMounted } from "vue"
import { storeToRefs } from 'pinia';
import { IonContent, IonItem, IonLabel, IonNote, IonItemOptions } from '@ionic/vue';
import { IonList, IonPage, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/vue';
import { IonCardContent, IonItemOption, IonCard, IonItemSliding, type RefresherCustomEvent } from "@ionic/vue";
import { bookmarkOutline, bookmarksOutline, colorFill, informationCircle, trashOutline } from 'ionicons/icons';
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
// utils
import { truncate } from "@/utils/string";
// composables
import { useLocale } from '@/composables/useLocale';
import { useBookmark } from "@/composables/useBookmark";
// stores
import { useAudioStore } from "@/stores/AudioStore";
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useJuzStore } from '@/stores/JuzStore';

const { getLine } = useLocale()
const { getAllStorageBookmarks, removeBookmark, allBookmarks } = useBookmark()
const { isVisible } = storeToRefs(useAudioStore())
const recitionsStore = useRecitionsStore()
const { juzList } = storeToRefs(useJuzStore())

const handleRefresh = (event: RefresherCustomEvent) => {
    setTimeout(async () => {
        await getAllStorageBookmarks()
        event.target.complete();
    }, 2000);
};

onMounted(async () => {
    await getAllStorageBookmarks()
})


</script>

<template>
    <ion-page>
        <header-component :title="getLine('bookmark.title')" :icon="bookmarksOutline" :is-loading="false"
            :search="false"></header-component>
        <ion-content :fullscreen="true" class="ion-padding">
            <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <ion-list :inset="true">
                <ion-card v-if="!allBookmarks.length">
                    <ion-card-content class="ion-text-center">
                        <ion-icon :icon="informationCircle"></ion-icon> {{ getLine('bookmark.emptyContent') }}
                    </ion-card-content>
                </ion-card>
                <ion-item-sliding v-for="bookmark in allBookmarks" :key="bookmark.key">
                    <ion-item button :detail="true" :router-link="bookmark.value.path">
                        <ion-icon slot="start" :icon="bookmarkOutline" color="primary"></ion-icon>
                        <ion-label>
                            <h3> {{ bookmark.value.chapterName }}</h3>
                            <ion-note class="rtl">{{ truncate(bookmark.value.verseText, 50) }}</ion-note>
                        </ion-label>
                        <ion-note slot="end">{{ bookmark.value.verseNumber }}</ion-note>
                    </ion-item>
                    <ion-item-options>
                        <ion-item-option color="danger" @click="removeBookmark(bookmark.key)">
                            <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
                        </ion-item-option>
                    </ion-item-options>
                </ion-item-sliding>
            </ion-list>
        </ion-content>
        <audio-player-component :model-value="isVisible" :selected-reciter="recitionsStore.selectedReciter"
            trigger="bookmarks-audio-modal" @update:model-value="isVisible = $event"
            :map-recitions="recitionsStore.mapRecitions"
            @update:selected-reciter="recitionsStore.handleSelectedReciter($event)" :juz-list="juzList">
        </audio-player-component>
    </ion-page>
</template>
<style scoped>
ion-item {
    --transition: none;
}

.small-font {
    font-size: x-small;
}

ion-accordion {
    margin: 0 auto;
}

.rtl {
    direction: rtl;
}

.pt-24 {
    padding-top: 24px
}
</style>