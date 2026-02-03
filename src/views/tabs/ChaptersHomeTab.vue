<script setup lang="ts">
import { onBeforeMount, shallowRef } from "vue"
import { storeToRefs } from 'pinia';
// ionic
import { IonPage, IonContent } from '@ionic/vue';
import { bookOutline } from "ionicons/icons";
// stores
import { useAudioStore } from "@/stores/AudioStore";
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useJuzStore } from '@/stores/JuzStore';
// composables
import { useLocale } from '@/composables/useLocale';
import { useMetaData } from "@/composables/useMetaData";
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import AllChaptersListComponent from "@/components/chapter/AllChaptersListComponent.vue";

const searchValue = shallowRef<string | null | undefined>("")
const { getLine } = useLocale()
const { isVisible } = storeToRefs(useAudioStore())
const { juzList } = storeToRefs(useJuzStore())
const recitionsStore = useRecitionsStore()
const { setPageTitle } = useMetaData()


onBeforeMount(() => {
  setPageTitle(getLine("metaChapter.list"))
})
</script>

<template>
  <ion-page>
    <header-component :title="getLine('tabs.chapters')" :icon="bookOutline"
      @update:search-value="searchValue = $event.detail.value" search></header-component>
    <ion-content :fullscreen="true">
      <all-chapters-list-component :search-value="searchValue"></all-chapters-list-component>
    </ion-content>
    <audio-player-component :model-value="isVisible" :selected-reciter="recitionsStore.selectedReciter"
      trigger="chapters-tab-audio-modal" @update:model-value="isVisible = $event"
      :map-recitions="recitionsStore.mapRecitions"
      @update:selected-reciter="recitionsStore.handleSelectedReciter($event, 'chapter')" :juz-list="juzList">
    </audio-player-component>
  </ion-page>
</template>
