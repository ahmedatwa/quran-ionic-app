<script setup lang="ts">
import { computed, shallowRef, watch, watchEffect, ref } from 'vue';
import { IonItem, IonList, IonSkeletonText } from '@ionic/vue';
import { IonInfiniteScroll, IonInfiniteScrollContent, IonToolbar } from '@ionic/vue';
import { IonText, IonLabel, IonNote, IonIcon, IonSearchbar } from '@ionic/vue';
import { chevronForward, chevronBack } from 'ionicons/icons';
// utils
import { localizeNumber } from '@/utils/number';
// composables
import { useLocale } from '@/composables/useLocale';
// types
import type { InfiniteScrollCustomEvent } from '@ionic/vue'
import type { Page } from "@/types/page";
// utils
import { DEFAULT_NUMBER_OF_PAGES } from "@/utils/pages"
// stores
import { usePageStore } from "@/stores/PageStore";

const { getLine, getLocale, isRtl } = useLocale()
const inputSearchValue = shallowRef<string | null | undefined>("")
const pages = ref<Page[]>([])
const pageStore = usePageStore()
const perPage = shallowRef(25)

const props = defineProps<{
  visibleSearchBar?: boolean
  searchValue?: string | null | undefined
}>()

const computedPages = computed(() => {
  return pages.value.filter((p) => {
    if (inputSearchValue.value?.length) {
      return p.pageNumber.toLocaleString() === inputSearchValue.value.toLocaleLowerCase()
    } else {
      return p.pageNumber
    }
  })
});

watchEffect(() => {
  if (pageStore.pagesList) {
    if (pages.value.length !== perPage.value) {
      pages.value = pageStore.pagesList.slice(0, perPage.value)
    }
  }
})

/**
 * @param event 
 */
const ionInfinite = (event: InfiniteScrollCustomEvent) => {
  if (pages.value.length < DEFAULT_NUMBER_OF_PAGES) {
    const start = pages.value.length
    const end = Math.ceil((perPage.value + pages.value.length))
    pageStore.pagesList.slice(start, end).forEach((page) => pages.value.push(page))
    setTimeout(() => event.target.complete(), 500);
  } else {
    event.target.complete()
    return;
  }
};

watch(() => props.searchValue, (val) => inputSearchValue.value = val)

</script>

<template>
  <div>
    <ion-toolbar v-if="visibleSearchBar">
      <ion-searchbar name="filter" @ion-input="inputSearchValue = $event.detail.value" :debounce="500" autocomplete="on"
        inputmode="text" type="text"></ion-searchbar>
    </ion-toolbar>
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
          <ion-text>{{ getLine('quranReader.textPage') }} {{ localizeNumber(page.pageNumber, getLocale)
            }}</ion-text>
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
  </div>
</template>