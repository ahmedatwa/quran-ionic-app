<script setup lang="ts">
import { ref, watchEffect, onMounted, computed } from "vue"
import { IonContent, IonItem, IonLabel, IonNote } from '@ionic/vue';
import { IonList, IonPage, IonIcon } from '@ionic/vue';
import { bookmarkOutline, bookmarksOutline } from 'ionicons/icons';
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
// utils
import { useLocale } from '@/utils/useLocale';
import { getStorage } from '@/utils/storage';
// type
import { useChapterStore } from "@/stores/ChapterStore";

const { getLine } = useLocale()
const { getChapterName } = useChapterStore()
const bookmarks = computed(() => getStorage("bookmarks"))

</script>

<template>
    <ion-page>
        <header-component :title="getLine('bookmark.title')" :icon="bookmarksOutline" :is-loading="false"
            :search="false"></header-component>
        <ion-content :fullscreen="true">
            <div class="ion-padding">
                <ion-list>
                    <ion-item button v-for="item in bookmarks" :key="item.route" :router-link="item.route">
                        <ion-icon slot="start" :icon="bookmarkOutline" color="danger"></ion-icon>
                        <ion-label>
                            <h3> {{ getChapterName(item.value.chapter_id)?.nameSimple }}</h3>
                            <ion-note>{{ item.value.text_uthmani }}</ion-note>
                        </ion-label>
                        <ion-note slot="end">{{ item.value.verse_number }}</ion-note>
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
</style>