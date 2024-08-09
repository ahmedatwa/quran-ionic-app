<script setup lang="ts">
import { ref, onBeforeMount, watchEffect } from "vue"
import { IonContent, IonItem, IonLabel, IonNote } from '@ionic/vue';
import { IonList, IonPage, IonIcon } from '@ionic/vue';
import { bookmarkOutline, bookmarksOutline } from 'ionicons/icons';
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
// utils
import { useLocale } from '@/utils/useLocale';
import { useStorage, BookmarkedItems } from "@/utils/useStorage";
import { truncate } from "@/utils/string";

const { getLine } = useLocale()
const bookmarks = ref<BookmarkedItems[]>([])
const { storage, bookmarkedItems, storageLength } = useStorage("__bookmarksdb")

onBeforeMount(async () => {
    const len = await storageLength()
    if (len) {
        storage.forEach((key, value, index) => {
            bookmarks.value.push({ key: value, value: key })
        })
    }
})

watchEffect(() => {
    if (bookmarkedItems.value) {
        bookmarkedItems.value.forEach((item) => {
            bookmarks.value?.push(item)
        })
    }
})

</script>

<template>
    <ion-page>
        <header-component :title="getLine('bookmark.title')" :icon="bookmarksOutline" :is-loading="false"
            :search="false"></header-component>
        <ion-content :fullscreen="true">
            <div class="ion-padding">
                <ion-list>
                    <ion-item button v-for="item in bookmarks" :key="item.key" :router-link="item.key">
                        <ion-icon slot="start" :icon="bookmarkOutline" color="danger"></ion-icon>
                        <ion-label>
                            <h3> {{ item.value.chapterName }}</h3>
                            <ion-note class="rtl">{{ truncate(item.value.verseText, 50) }}</ion-note>
                        </ion-label>
                        <ion-note slot="end">{{ item.value.verseNumber }}</ion-note>
                    </ion-item>
                </ion-list>
            </div>
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
</style>