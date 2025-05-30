<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { newspaperOutline, documentOutline, bookOutline } from 'ionicons/icons';
import { cogOutline, bookmarkOutline } from 'ionicons/icons';
// composables
import { useLocale } from '@/composables/useLocale';
// components
import AudioFabComponent from '@/components/audio/AudioFabComponent.vue';

const { getLine } = useLocale()

</script>

<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="chapters" href="/chapters">
          <ion-icon :icon="bookOutline" />
          <ion-label>{{ getLine('tabs.chapters') }}</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="juzs" href="/juzs">
          <ion-icon :icon="newspaperOutline" />
          <ion-label>{{ getLine('tabs.juzs') }}</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="pages" href="/pages">
          <ion-icon :icon="documentOutline" />
          <ion-label>{{ getLine('tabs.pages') }}</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="bookmarks" href="/bookmarks">
          <ion-icon :icon="bookmarkOutline" />
          <ion-label>{{ getLine('tabs.bookmarks') }}</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="settings" href="/settings">
          <ion-icon :icon="cogOutline" />
          <ion-label>{{ getLine('tabs.settings') }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
    <audio-fab-component />
  </ion-page>
</template>
