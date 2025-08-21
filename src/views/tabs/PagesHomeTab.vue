<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from "vue"
import { storeToRefs } from 'pinia';
import { IonPage, IonItem, IonList, IonContent, IonSkeletonText, IonInfiniteScrollContent } from '@ionic/vue';
import { IonText, IonLabel, IonNote, IonIcon, IonInfiniteScroll } from '@ionic/vue';
import { chevronForward, documentOutline, chevronBack } from 'ionicons/icons';
// composables
import { useLocale } from '@/composables/useLocale';
import { useMetaData } from "@/composables/useMetaData";
// utils
import { DEFAULT_NUMBER_OF_PAGES } from "@/utils/pages"
import { localizeNumber } from '@/utils/number';
// stores
import { usePageStore } from "@/stores/PageStore";
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useJuzStore } from '@/stores/JuzStore';
import { useAudioStore } from "@/stores/AudioStore";
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
// types
import type { InfiniteScrollCustomEvent } from '@ionic/vue'
import type { Page } from "@/types/page";

const { getLine, getLocale, isRtl } = useLocale()
const pageStore = usePageStore()
const { setMetaData, setPageTitle } = useMetaData()
const recitionsStore = useRecitionsStore()
const { isVisible } = storeToRefs(useAudioStore())
const { juzList } = storeToRefs(useJuzStore())
const searchValue = ref("")
const perPage = ref(15)
const pages = ref<Page[]>([])

watchEffect(() => {
  if (pageStore.pagesList) {
    if (pages.value.length !== perPage.value) {
      pages.value = pageStore.pagesList.slice(0, perPage.value)
    }
  }
})


const computedPages = computed(() => {
  if (pages.value) {
    return pages.value.filter((p) => {
      return p.pageNumber.toLocaleString().includes(searchValue.value.toLocaleLowerCase())
    })
  }
});

const ionInfinite = (event: InfiniteScrollCustomEvent) => {
  if (pages.value.length < DEFAULT_NUMBER_OF_PAGES) {
    const newPages: Page[] = pageStore.pagesList.slice(pages.value.length, (perPage.value + pages.value.length))
    newPages.forEach((p) => pages.value.push({ ...p }))
    event.target.complete()
  } else {
    event.target.complete()
  }
};

onMounted(() => {
  setPageTitle(getLine("metaPage.list"))
})

</script>

<template>
  <ion-page>
    <header-component :title="getLine('tabs.pages')" :icon="documentOutline" input-mode="numeric" type="number"
      @update:search-value="searchValue = $event.detail.value" search></header-component>
    <ion-content :fullscreen="true">
      <ion-list v-if="!computedPages?.length">
        <ion-item v-for="n in DEFAULT_NUMBER_OF_PAGES" :key="n">
          <ion-skeleton-text :animated="true" style="width: 100%; height: 20px;"></ion-skeleton-text>
        </ion-item>
      </ion-list>
      <ion-list v-else>
        <ion-item :button="true" :detail="false" v-for="page in computedPages" :key="page.pageNumber"
          :router-link="{ name: 'single.page', params: { pageId: page.pageNumber } }"
          @click="pageStore.selectedPage = page">
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
      <ion-infinite-scroll @ionInfinite="ionInfinite">
        <ion-infinite-scroll-content loading-text="Please wait..."
          loading-spinner="bubbles"></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
    <audio-player-component :model-value="isVisible" :selected-reciter="recitionsStore.selectedReciter"
      @update:model-value="isVisible = $event" :map-recitions="recitionsStore.mapRecitions"
      @update:selected-reciter="recitionsStore.handleSelectedReciter($event)" :juz-list="juzList">
    </audio-player-component>
  </ion-page>
</template>
