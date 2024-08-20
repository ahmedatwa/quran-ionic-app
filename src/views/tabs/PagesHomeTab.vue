<script setup lang="ts">
import { computed } from "vue"
import { IonPage, IonItem, IonList, IonContent, IonSkeletonText } from '@ionic/vue';
import { IonText, IonLabel, IonNote, IonIcon } from '@ionic/vue';
import { IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent } from '@ionic/vue';
// utils
import { useLocale } from '@/utils/useLocale';
import { DEFAULT_NUMBER_OF_PAGES } from "@/utils/pages"
import { localizeNumber } from '@/utils/number';
// stores
import { usePageStore } from "@/stores/PageStore";
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
// icons
import { chevronForward, documentOutline, chevronBack } from 'ionicons/icons';

const { getLine, getLocale, isRtl } = useLocale()
const pageStore = usePageStore()
const pages = computed(() => pageStore.pages)

const ionInfinite = (ev: InfiniteScrollCustomEvent) => {
  if (DEFAULT_NUMBER_OF_PAGES === pageStore.pages?.length) {
    setTimeout(() => ev.target.complete(), 300);
  } else {
    pageStore.pagesPageSize = pageStore.pagesPageSize + 10
    setTimeout(() => ev.target.complete(), 700);
  }
};


</script>

<template>
  <ion-page>
    <header-component :title="getLine('tabs.pages')" :icon="documentOutline"
      @update:search-value=" pageStore.searchValue = $event" search></header-component>
    <ion-content :fullscreen="true">
      <ion-list v-if="!pages?.length">
        <ion-item v-for="n in DEFAULT_NUMBER_OF_PAGES" :key="n">
          <ion-skeleton-text :animated="true" style="width: 100%; height: 20px;"></ion-skeleton-text>
        </ion-item>
      </ion-list>
      <ion-list v-else>
        <ion-item :button="true" :detail="false" v-for="page in pages" :key="page.pageNumber"
          :router-link="`page/${page.pageNumber}`">
          <ion-label>
            <ion-text>{{ getLine('quranReader.textPage') }} {{ localizeNumber(page.pageNumber, getLocale) }}</ion-text>
            <ion-text v-for="(chapter, index) in page.chaptersMap" :key="index" color="medium" class="d-flex">
              {{ chapter.nameSimple }}</ion-text>
          </ion-label>
          <div class="metadata-end-wrapper" slot="end">
            <ion-note color="medium">{{ page.chaptersMap?.length }}</ion-note>
            <ion-icon color="medium" :icon="isRtl ? chevronBack : chevronForward"></ion-icon>
          </div>
        </ion-item>
      </ion-list>
      <ion-infinite-scroll @ion-infinite="ionInfinite">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  </ion-page>
</template>
