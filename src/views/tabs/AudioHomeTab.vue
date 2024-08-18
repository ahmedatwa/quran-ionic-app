<script setup lang="ts">
import { ref } from "vue"
// ionic
import { IonPage, IonContent, IonSkeletonText } from '@ionic/vue';
import { IonItem, IonList, IonLabel, IonIcon } from '@ionic/vue';
import { musicalNotesOutline, pauseCircleOutline } from "ionicons/icons";
// stores
import { useChapterStore } from '@/stores/ChapterStore';
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";
// utils
import { useLocale } from '@/utils/useLocale';
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import AudioPlayerComponent from '@/components/audio/AudioPlayerComponent.vue';

const { getLine, isRtl } = useLocale()
const chapterStore = useChapterStore()
const audioPlayerStore = useAudioPlayerStore()
const audioPlayModel = ref(false)

const handleSearch = (query: string) => {
  chapterStore.searchValue = query
}

const play = async (id: number) => {
  await audioPlayerStore.getAudio({ audioID: id })
  audioPlayModel.value = true
}

</script>

<template>
  <ion-page>
    <header-component :title="getLine('tabs.audio')" :icon="musicalNotesOutline" @update:search-value="handleSearch"
      search>
    </header-component>
    <ion-content :fullscreen="true">
      <ion-list v-if="!chapterStore.chapters?.length">
        <ion-item v-for="n in chapterStore.TOTAL_CHAPTERS" :key="n">
          <ion-skeleton-text :animated="true" style="width: 100%; height: 20px;"></ion-skeleton-text>
        </ion-item>
      </ion-list>
      <ion-list>
        <ion-item v-for="chapter in chapterStore.chapters" :key="chapter.id" @click="play(chapter.id)">
          <ion-icon v-show="chapter.id === audioPlayerStore.chapterId && audioPlayerStore.isPlaying" aria-hidden="true"
            :icon="pauseCircleOutline" slot="start" size="small" color="primary"></ion-icon>
          <ion-label>{{ isRtl ? chapter.nameArabic : chapter.nameSimple }}
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
    <audio-player-component :model-value="audioPlayModel"
    @update:model-value="audioPlayModel = $event"></audio-player-component>
  </ion-page>
</template>