<script setup lang="ts">
// ionic
import { IonPage, IonHeader, IonToolbar, IonContent, IonSearchbar } from '@ionic/vue';
import { IonTitle, IonNote, IonItem, IonList, IonLabel } from '@ionic/vue';
// stores
import { useChapterStore } from '@/stores/ChapterStore';
// utils
import { localizeNumber } from '@/utils/number';
import { useLocale } from '@/utils/useLocale';
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import { bookOutline } from "ionicons/icons";

const { getLocale, isRtl, getLine } = useLocale()
const chapterStore = useChapterStore()

const handleSearch = (query: string) => {
  chapterStore.searchValue = query
}
</script>

<template>
  <ion-page>
    <header-component :title="getLine('tabs.chapters')" :is-loading="chapterStore.isLoading.chapters"
      :icon="bookOutline" @update:search-value="handleSearch">
    </header-component>
    <ion-content :fullscreen="true">
      <ion-list>
        <ion-item button detail v-for="chapter in chapterStore.chapters" :key="chapter.id"
          :router-link="`chapter/${chapter.id}`">
          <ion-label>
            <span v-if="isRtl">{{ localizeNumber(chapter.id,
              getLocale) }}- {{ chapter.nameArabic }}
            </span>
            <span v-else>{{ chapter.id }}- {{ chapter.nameSimple }}</span>
          </ion-label>
          <ion-note slot="end">{{ chapter.versesCount }}</ion-note>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>