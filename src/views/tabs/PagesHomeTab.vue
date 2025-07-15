<script setup lang="ts">
import { shallowRef, computed } from "vue"
import { IonPage, IonItem, IonList, IonContent, IonSkeletonText } from '@ionic/vue';
import { IonText, IonLabel, IonNote, IonIcon } from '@ionic/vue';
import { chevronForward, documentOutline, chevronBack } from 'ionicons/icons';
// composables
import { useLocale } from '@/composables/useLocale';
// utils
import { DEFAULT_NUMBER_OF_PAGES } from "@/utils/pages"
import { localizeNumber } from '@/utils/number';
// stores
import { usePageStore } from "@/stores/PageStore";
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';

const { getLine, getLocale, isRtl } = useLocale()
const pageStore = usePageStore()
const searchValue = shallowRef("")

const pages = computed(() => {
  if (pageStore.pagesList) {
    return pageStore.pagesList.filter((p) => {
      return p.pageNumber.toLocaleString().includes(searchValue.value.toLocaleLowerCase())
    })
  }
});

</script>

<template>
  <ion-page>
    <header-component :title="getLine('tabs.pages')" :icon="documentOutline" input-mode="numeric" type="number"
      @update:search-value="searchValue = $event.detail.value" search></header-component>
    <ion-content :fullscreen="true">
      <ion-list v-if="!pages?.length">
        <ion-item v-for="n in DEFAULT_NUMBER_OF_PAGES" :key="n">
          <ion-skeleton-text :animated="true" style="width: 100%; height: 20px;"></ion-skeleton-text>
        </ion-item>
      </ion-list>
      <ion-list v-else>
        <ion-item :button="true" :detail="false" v-for="page in pages" :key="page.pageNumber"
          :router-link="{ name: 'single.page', params: { pageId: page.pageNumber } }">
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
    </ion-content>
  </ion-page>
</template>
