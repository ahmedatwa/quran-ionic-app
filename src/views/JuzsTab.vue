<script setup lang="ts">
import { computed } from "vue"
import { IonHeader, IonToolbar, IonTitle, IonSearchbar, IonPage, loadingController } from '@ionic/vue';
import { IonLabel, IonNote, IonContent, IonList, IonItem, IonText, IonIcon } from '@ionic/vue';
// utils
import { useLocale } from '@/utils/useLocale';
// types
import type { JuzVerseMapping } from '@/types/juz';
// stores
import { useJuzStore } from '@/stores/JuzStore';
import { useChapterStore } from "@/stores/ChapterStore";
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
// icons
import { chevronForward, newspaperOutline } from "ionicons/icons";

const juzStore = useJuzStore()
const { getChapter } = useChapterStore()
const { getLine } = useLocale()

const handleInput = (event: Event) => {
  const query = (event.target as HTMLInputElement).value.toLowerCase();
  juzStore.searchValue = query
}


const juzsMapWithChapters = computed(() => {
  if (juzStore.juzs) {
    const map = juzStore.juzs.map((juz) => {
      return {
        ...juz,
        chapters: getChapterAndVerseMappingForJuz(juz.juz_number, juz.verse_mapping)
      }
    })

    return map.filter((j) => {
      return j.juz_number.toLocaleString().replace(/([\-\'])/, "").includes(
        juzStore.searchValue.toLocaleLowerCase().replace(/([\-\'])/, "")
      );
    })
  }
})

const getChapterAndVerseMappingForJuz = (juzNumber: number, verseMapping: JuzVerseMapping) => {
  const array = []
  for (const key in verseMapping) {
    const verses = verseMapping[key];
    const chapterFound = getChapter(Number(key))
    if (chapterFound) {
      array.push({
        juzNumber: juzNumber,
        chapterId: key,
        en: chapterFound.nameSimple,
        ar: chapterFound.nameArabic,
        verses

      })
    }
  }
  return array
}

const handleSearch = (query: string) => {
  juzStore.searchValue = query
}

</script>
<template>
  <ion-page>
    <header-component :title="getLine('tabs.juzs')" :is-loading="juzStore.isLoading" :icon="newspaperOutline"
      @update:search-value="handleSearch"></header-component>
    <ion-content :fullscreen="true">
      <ion-list>
        <ion-item :button="true" :detail="false" v-for="juz in juzsMapWithChapters" :key="juz.id"
          :router-link="`juz/${juz.juz_number}`">
          <ion-label>
            <strong>Juz-{{ juz.juz_number }}</strong>
            <ion-text v-for="chapter in juz.chapters" :key="chapter.chapterId" color="medium" class="d-flex">
              {{ chapter.en }}</ion-text>
          </ion-label>
          <div class="metadata-end-wrapper" slot="end">
            <ion-note color="medium">{{ juz.chapters.length }}</ion-note>
            <ion-icon color="medium" :icon="chevronForward"></ion-icon>
          </div>
        </ion-item>
      </ion-list>
    </ion-content>
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