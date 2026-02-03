<script setup lang="ts">
import { shallowRef } from "vue"
import { storeToRefs } from 'pinia';
import { IonContent, IonPage } from '@ionic/vue';
import { newspaperOutline } from "ionicons/icons";
// composables
import { useLocale } from '@/composables/useLocale';
// stores
import { useJuzStore } from '@/stores/JuzStore';
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useAudioStore } from "@/stores/AudioStore";
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
import AllJuzsListComponent from "@/components/juz/AllJuzsListComponent.vue";

const { isVisible } = storeToRefs(useAudioStore())
const recitionsStore = useRecitionsStore()
const { juzList } = storeToRefs(useJuzStore())
const { getLine } = useLocale()
const searchValue = shallowRef<string | null | undefined>("")


</script>
<template>
  <ion-page>
    <header-component :title="getLine('tabs.juzs')" :icon="newspaperOutline" input-mode="numeric" type="number"
      @update:search-value="searchValue = $event.detail.value" search></header-component>
    <ion-content :fullscreen="true">
      <all-juzs-list-component :search-value="searchValue"></all-juzs-list-component>
    </ion-content>
    <audio-player-component :model-value="isVisible" :selected-reciter="recitionsStore.selectedReciter"
      @update:model-value="isVisible = $event" :map-recitions="recitionsStore.mapRecitions"
      trigger="juzs-tab-audio-modal" @update:selected-reciter="recitionsStore.handleSelectedReciter($event, 'juz')"
      :juz-list="juzList">
    </audio-player-component>
  </ion-page>
</template>
<style scoped>
.unread-indicator {
  background: var(--ion-color-primary);
  width: 10px;
  height: 10px;
  border-radius: 100%;
  position: absolute;
  inset-inline-start: 12px;
  top: 12px;
}

.metadata-end-wrapper {
  position: absolute;
  top: 10px;
  inset-inline-end: 10px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
}

ion-label strong {
  display: block;
  max-width: calc(100% - 60px);
  overflow: hidden;
  text-overflow: ellipsis;
}

ion-label ion-note {
  font-size: 0.9rem;
}
</style>