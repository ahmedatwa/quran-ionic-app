<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonText, IonLabel, IonIcon, IonItem } from '@ionic/vue';
import { IonTitle, IonContent, IonNote, IonSearchbar, IonList, IonProgressBar } from '@ionic/vue';
// utils
import { useLocale } from '@/utils/useLocale';
// stores
import { usePageStore } from "@/stores/PageStore";
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
// icons
import { chevronForward } from "ionicons/icons";
// icons
import { documentOutline } from 'ionicons/icons';

const { getLine } = useLocale()
const pageStore = usePageStore()

const handleSearch = (query: string) => {
  pageStore.searchValue = query
}

</script>

<template>
  <ion-page>
    <header-component :title="getLine('tabs.pages')" :is-loading="pageStore.isLoading" :icon="documentOutline"
      @update:search-value="handleSearch"></header-component>
    <ion-content :fullscreen="true">
      <ion-list>
        <ion-item :button="true" :detail="false" v-for="page in pageStore.pages" :key="page.pageNumber"
          :router-link="`page/${page.pageNumber}`">
          <ion-label>
            <strong>Page-{{ page.pageNumber }}</strong>
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
