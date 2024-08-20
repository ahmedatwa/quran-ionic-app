<script setup lang="ts">
// ionic
import { IonPage, IonContent, IonSkeletonText } from '@ionic/vue';
import { IonNote, IonItem, IonList, IonLabel } from '@ionic/vue';
// stores
import { useChapterStore } from '@/stores/ChapterStore';
// utils
import { localizeNumber } from '@/utils/number';
import { useLocale } from '@/utils/useLocale';
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import { bookOutline } from "ionicons/icons";

const { getLocale, getLine, isRtl } = useLocale()
const chapterStore = useChapterStore()

const handleSearch = (query: string) => {
  chapterStore.searchValue = query
}

</script>

<template>
  <ion-page>
    <header-component :title="getLine('tabs.chapters')" :icon="bookOutline"
      @update:search-value="handleSearch" search>
    </header-component>
    <ion-content :fullscreen="true">
      <ion-list v-if="!chapterStore.chapters?.length">
        <ion-item v-for="n in chapterStore.TOTAL_CHAPTERS" :key="n">
          <ion-skeleton-text :animated="true" style="width: 100%; height: 20px;"></ion-skeleton-text>
        </ion-item>
      </ion-list>
      <ion-list>
        <ion-item button detail v-for="chapter in chapterStore.chapters" :key="chapter.id"
          :router-link="`chapter/${chapter.id}`">
          <ion-label>{{ localizeNumber(chapter.id, getLocale) }}- {{ isRtl ? chapter.nameArabic : chapter.nameSimple }}
          </ion-label>
          <ion-note slot="end">{{ chapter.versesCount }}</ion-note>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>