<script setup lang="ts">
import { IonPage, IonItem, IonList, IonContent, IonSkeletonText } from '@ionic/vue';
import { IonText, IonLabel, IonNote, IonIcon } from '@ionic/vue';
// utils
import { useLocale } from '@/utils/useLocale';
import { DEFAULT_NUMBER_OF_PAGES } from "@/utils/pages"
// stores
import { usePageStore } from "@/stores/PageStore";
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
// icons
import { chevronForward, documentOutline } from 'ionicons/icons';

const { getLine } = useLocale()
const pageStore = usePageStore()

const handleSearch = (query: string) => {
  pageStore.searchValue = query
}

</script>

<template>
  <ion-page>
    <header-component :title="getLine('tabs.pages')" :icon="documentOutline" @update:search-value="handleSearch"
      search></header-component>
    <ion-content :fullscreen="true">
      <ion-list v-if="!pageStore.pages?.length">
        <ion-item v-for="n in DEFAULT_NUMBER_OF_PAGES" :key="n">
          <ion-skeleton-text :animated="true" style="width: 100%; height: 20px;"></ion-skeleton-text>
        </ion-item>
      </ion-list>
      <ion-list v-else>
        <ion-item :button="true" :detail="false" v-for="page in pageStore.pages" :key="page.pageNumber"
          :router-link="`page/${page.pageNumber}`">
          <ion-label>
            <ion-text>Page-{{ page.pageNumber }}</ion-text>
            <ion-text v-for="(chapter, index) in page.chaptersMap" :key="index" color="medium" class="d-flex">
              {{ chapter.nameSimple }}</ion-text>
          </ion-label>
          <div class="metadata-end-wrapper" slot="end">
            <ion-note color="medium">{{ page.chaptersMap?.length }}</ion-note>
            <ion-icon color="medium" :icon="chevronForward"></ion-icon>
          </div>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>
