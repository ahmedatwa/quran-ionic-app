<script setup lang="ts">
import { shallowRef, computed } from "vue"
import { storeToRefs } from 'pinia';
import { IonPage, IonSkeletonText, IonText, IonIcon, IonSpinner } from '@ionic/vue';
import { IonLabel, IonNote, IonContent, IonList, IonItem, IonFooter } from '@ionic/vue';
import { chevronBack, chevronForward, newspaperOutline } from "ionicons/icons";
// composables
import { useLocale } from '@/composables/useLocale';
// utils
import { localizeNumber } from '@/utils/number';
// stores
import { useJuzStore } from '@/stores/JuzStore';
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useAudioStore } from "@/stores/AudioStore";
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";

const searchValue = shallowRef("");
const juzStore = useJuzStore()
const { isVisible, isPlaying, chapterId } = storeToRefs(useAudioStore())
const recitionsStore = useRecitionsStore()
const { juzList } = storeToRefs(useJuzStore())
const { getLine, getLocale, isRtl } = useLocale()

const juzs = computed(() => {
  if (juzStore.juzList) {
    return juzStore.juzList.filter((v) => {
      return v.juz_number.toLocaleString().includes(searchValue.value.toLocaleLowerCase())
    })
  }
});

const verseMapping = computed((): string[] | undefined => {
  if (juzStore.selectedJuz) {
    return Object.keys(juzStore.selectedJuz?.verse_mapping)
  }
})

const isAudioPlaying = (juzNumber: number) => {
  if (isPlaying.value) {
    if (juzNumber === juzStore.selectedJuz?.juz_number) {
      if (chapterId.value) {
        return verseMapping.value?.includes(chapterId.value.toString())
      }
    }
  }
}

</script>
<template>
  <ion-page>
    <header-component :title="getLine('tabs.juzs')" :icon="newspaperOutline" input-mode="numeric" type="number"
      @update:search-value="searchValue = $event.detail.value" search></header-component>
    <ion-content :fullscreen="true">
      <ion-list v-if="!juzs?.length">
        <ion-item v-for="n in 30" :key="n">
          <ion-skeleton-text :animated="true" style="width: 100%; height: 20px;"></ion-skeleton-text>
        </ion-item>
      </ion-list>
      <ion-list v-else>
        <ion-item :button="true" :detail="false" v-for="juz in juzs" :key="juz.id"
          :router-link="{ name: 'single.juz', params: { juzId: juz.juz_number } }">
          <ion-label>
            <ion-spinner name="dots" color="danger" class="mr-3" v-if="isAudioPlaying(juz.juz_number)"></ion-spinner>
            <ion-text>{{ getLine('quranReader.textJuz') }} {{ localizeNumber(juz.juz_number, getLocale) }}</ion-text>
            <ion-text v-for="chapter in juz.chapters" :key="chapter.chapterId" color="medium" class="d-flex">
              {{ chapter.en }}</ion-text>
          </ion-label>
          <div class="metadata-end-wrapper" slot="end">
            <ion-note color="medium">{{ juz.chapters?.length }}</ion-note>
            <ion-icon color="medium" :icon="isRtl ? chevronBack : chevronForward"></ion-icon>
          </div>
        </ion-item>
      </ion-list>
    </ion-content>
    <audio-player-component :model-value="isVisible" :selected-reciter="recitionsStore.selectedReciter"
      @update:model-value="isVisible = $event" :map-recitions="recitionsStore.mapRecitions"
      @update:selected-reciter="recitionsStore.handleSelectedReciter($event)" :juz-list="juzList">
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