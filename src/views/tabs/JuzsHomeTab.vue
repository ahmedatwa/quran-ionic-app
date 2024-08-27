<script setup lang="ts">
import { IonPage, IonSkeletonText, IonText, IonIcon } from '@ionic/vue';
import { IonLabel, IonNote, IonContent, IonList, IonItem } from '@ionic/vue';
// utils
import { useLocale } from '@/utils/useLocale';
import { localizeNumber } from '@/utils/number';
// stores
import { useJuzStore } from '@/stores/JuzStore';
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
// icons
import { chevronBack, chevronForward, newspaperOutline } from "ionicons/icons";

const juzStore = useJuzStore()
const { getLine, getLocale, isRtl } = useLocale()

const handleSearch = (query: string) => {
  juzStore.searchValue = query
}

</script>
<template>
  <ion-page>
    <header-component :title="getLine('tabs.juzs')" :icon="newspaperOutline" @update:search-value="handleSearch"
      input-mode="numeric" type="number" search></header-component>
    <ion-content :fullscreen="true">
      <ion-list v-if="!juzStore.juzs.length">
        <ion-item v-for="n in 30" :key="n">
          <ion-skeleton-text :animated="true" style="width: 100%; height: 20px;"></ion-skeleton-text>
        </ion-item>
      </ion-list>
      <ion-list>
        <ion-item :button="true" :detail="false" v-for="juz in juzStore.juzs" :key="juz.id"
          :router-link="{ name: 'single.juz', params: { juzId: juz.juz_number } }">
          <ion-label>
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