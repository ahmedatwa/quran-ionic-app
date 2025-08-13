<script setup lang="ts">
import { ref, onBeforeMount, watchEffect } from "vue"
import { storeToRefs } from 'pinia';
import { IonContent, IonItem, IonLabel, IonNote, IonItemOptions } from '@ionic/vue';
import { IonList, IonPage, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/vue';
import { IonCardContent, IonItemOption, IonCard, IonItemSliding } from "@ionic/vue";
import { bookmarkOutline, bookmarksOutline, trashOutline } from 'ionicons/icons';
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
// utils
import { truncate } from "@/utils/string";
// composables
import { useLocale } from '@/composables/useLocale';
import { useStorage } from "@/composables/useStorage";
import { useBookmark } from "@/composables/useBookmark";
// type
import type { BookmarkedItems } from "@/composables/useBookmark"
// stores
import { useAudioStore } from "@/stores/AudioStore";
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useJuzStore } from '@/stores/JuzStore';

const { getLine } = useLocale()
const bookmarks = ref<BookmarkedItems[]>([])
const bookmarksBD = useStorage("__bookmarksDB")
const { bookmarkedItems } = useBookmark(null)
const { isVisible } = storeToRefs(useAudioStore())
const recitionsStore = useRecitionsStore()
const { juzList } = storeToRefs(useJuzStore())

onBeforeMount(async () => {
    const len = await bookmarksBD.storageLength()
    if (len) {
        getBookmarkedStorage()
    }
})

watchEffect(() => {
    if (bookmarkedItems.value) {
        bookmarkedItems.value.forEach((item) => {
            if (!bookmarks.value.includes(item)) {
                bookmarks.value?.push(item)
            }
        })
    }
})

const handleRefresh = (ev: CustomEvent) => {
    setTimeout(() => {
        getBookmarkedStorage();
        (ev.target as HTMLIonRefresherElement)?.complete();
    }, 2000);
};

const getBookmarkedStorage = () => {
    bookmarksBD.storage.value?.forEach((key, value) => {
        const result = bookmarks.value.find(({ key }) => key.includes(value))
        if (!result) {
            bookmarks.value.push({ key: value, value: key })
        }
    })
}

const deleteBookmark = async (key: string) => {
    bookmarks.value = bookmarks.value.filter((b) => b.key !== key)
    await bookmarksBD.removeItem(key)
}

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
                <ion-card v-if="!bookmarks.length">
                    <ion-card-content class="ion-text-center">{{ getLine('bookmark.emptyContent') }}</ion-card-content>
                </ion-card>
                <ion-item-sliding v-for="item in bookmarks" :key="item.key">
                    <ion-item button :detail="true" :router-link="item.key">
                        <ion-icon slot="start" :icon="bookmarkOutline" color="danger"></ion-icon>
                        <ion-label>
                            <h3> {{ item.value.chapterName }}</h3>
                            <ion-note class="rtl">{{ truncate(item.value.verseText, 50) }}</ion-note>
                        </ion-label>
                        <ion-note slot="end">{{ item.value.verseNumber }}</ion-note>
                    </ion-item>
                    <ion-item-options>
                        <ion-item-option color="danger" @click="deleteBookmark(item.key)">
                            <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
                        </ion-item-option>
                    </ion-item-options>
                </ion-item-sliding>
            </ion-list>
        </ion-content>
        <audio-player-component :model-value="isVisible" :selected-reciter="recitionsStore.selectedReciter"
            @update:model-value="isVisible = $event" :map-recitions="recitionsStore.mapRecitions"
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