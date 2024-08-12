<script setup lang="ts">
import { ref, onBeforeMount, watchEffect } from "vue"
import { IonContent, IonItem, IonLabel, IonNote, IonItemOptions } from '@ionic/vue';
import { IonList, IonPage, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/vue';
import { IonCardContent, IonItemOption, IonCard, IonItemSliding } from "@ionic/vue";
import { bookmarkOutline, bookmarksOutline, trashOutline } from 'ionicons/icons';
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
// utils
import { useLocale } from '@/utils/useLocale';
import { useStorage, BookmarkedItems } from "@/utils/useStorage";
import { truncate } from "@/utils/string";


const { getLine } = useLocale()
const bookmarks = ref<BookmarkedItems[]>([])
const bookmarksBD = useStorage("__bookmarksDB")

onBeforeMount(async () => {
    const len = await bookmarksBD.storageLength()
    if (len) {
        getBookmarkedStorage()
    }
})

watchEffect(() => {
    if (bookmarksBD.bookmarkedItems.value) {
        bookmarksBD.bookmarkedItems.value.forEach((item) => {
            bookmarks.value?.push(item)
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
    // delete db key
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