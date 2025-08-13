<script setup lang="ts">
import { computed, shallowRef } from "vue"
import { storeToRefs } from 'pinia';
// ionic
import { IonPage, IonContent, IonSkeletonText } from '@ionic/vue';
import { IonNote, IonItem, IonList, IonLabel, IonSpinner } from '@ionic/vue';
import { bookOutline } from "ionicons/icons";
// stores
import { useAudioStore } from "@/stores/AudioStore";
import { useChapterStore } from '@/stores/ChapterStore';
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useJuzStore } from '@/stores/JuzStore';
// utils
import { localizeNumber } from '@/utils/number';
// composables
import { useLocale } from '@/composables/useLocale';
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import AudioPlayerComponent from "@/components/audio/AudioPlayerComponent.vue";
// types
import type { Chapter } from "@/types/chapter"

const searchValue = shallowRef("")
const { getLocale, getLine, isRtl } = useLocale()
const { isPlaying, chapterId, isVisible } = storeToRefs(useAudioStore())
const { juzList } = storeToRefs(useJuzStore())
const { chaptersList, TOTAL_CHAPTERS } = useChapterStore()
const recitionsStore = useRecitionsStore()

const playingState = (id: number) => isPlaying.value && id === chapterId.value

const chapters = computed((): Chapter[] | undefined => {
  if (chaptersList) {
    const searchableKeys = ["nameSimple", "nameArabic", "id"];
    return chaptersList.filter(
      (chapter: { nameSimple: string; nameArabic: string; id: number }) => {
        return searchableKeys.some((key) => {
          return chapter[key as keyof typeof chapter]
            .toString()
            .toLocaleLowerCase()
            .replace(/([\-\'])/, "")
            .includes(
              searchValue.value.toLocaleLowerCase().replace(/([\-\'])/, "")
            );
        });
      }
    );
  }
});

</script>

<template>
  <ion-page>
    <header-component :title="getLine('tabs.chapters')" :icon="bookOutline"
      @update:search-value="searchValue = $event.detail.value" search></header-component>
    <ion-content :fullscreen="true">
      <ion-list v-if="!chapters?.length">
        <ion-item v-for="n in TOTAL_CHAPTERS" :key="n">
          <ion-skeleton-text :animated="true" style="width: 100%; height: 20px;"></ion-skeleton-text>
        </ion-item>
      </ion-list>
      <ion-list v-else>
        <ion-item button detail v-for="chapter in chapters" :key="chapter.id"
          :router-link="`chapter/${chapter.id}`">
          <ion-spinner name="dots" color="danger" class="ml-1" v-if="playingState(chapter.id)"></ion-spinner>
          <ion-label>{{ localizeNumber(chapter.id, getLocale) }}- {{ isRtl ? chapter.nameArabic : chapter.nameSimple }}
          </ion-label>
          <ion-note slot="end">{{ chapter.versesCount }}</ion-note>
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
.ml-1 {
  margin-right: 2px;
}

ion-col {
  border: solid 1px #333;
  text-align: center;
}
</style>