<script setup lang="ts">
import { onMounted, shallowRef } from "vue"
import { storeToRefs } from 'pinia';
import { IonPage, IonContent } from '@ionic/vue';
import { documentOutline } from 'ionicons/icons';
// composables
import { useLocale } from '@/composables/useLocale';
import { useMetaData } from "@/composables/useMetaData";
// stores
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useJuzStore } from '@/stores/JuzStore';
import { useAudioStore } from "@/stores/AudioStore";
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import AllPagesListComponent from "@/components/page/AllPagesListComponent.vue";

const { getLine } = useLocale()
const {  setPageTitle } = useMetaData()
const recitionsStore = useRecitionsStore()
const { isVisible } = storeToRefs(useAudioStore())
const { juzList } = storeToRefs(useJuzStore())
const searchValue = shallowRef<string | null | undefined>("")

onMounted(() => {
  setPageTitle(getLine("metaPage.list"))
})

</script>

<template>
  <ion-page>
    <header-component :title="getLine('tabs.pages')" :icon="documentOutline" input-mode="numeric" type="number"
      @update:search-value="searchValue = $event.detail.value" search></header-component>
    <ion-content :fullscreen="true">
      <all-pages-list-component :search-value="searchValue"></all-pages-list-component>
    </ion-content>
    <audio-player-component :model-value="isVisible" :selected-reciter="recitionsStore.selectedReciter"
      @update:model-value="isVisible = $event" :map-recitions="recitionsStore.mapRecitions"
      trigger="pages-tab-audio-modal" @update:selected-reciter="recitionsStore.handleSelectedReciter($event, 'page')"
      :juz-list="juzList">
    </audio-player-component>
  </ion-page>
</template>
