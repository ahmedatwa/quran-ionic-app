<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { newspaperOutline, documentOutline, bookOutline, cogOutline } from 'ionicons/icons';
import { useLocale } from '@/utils/useLocale';
const { getLine } = useLocale()
</script>

<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="chapters" href="/chapters">
          <ion-icon :icon="bookOutline" />
          <ion-label>{{ getLine('tabs.chapter') }}</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="juzs" href="/juzs">
          <ion-icon :icon="newspaperOutline" />
          <ion-label>{{ getLine('tabs.juzs') }}</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="pages" href="/pages">
          <ion-icon :icon="documentOutline" />
          <ion-label>{{ getLine('tabs.pages') }}</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="settings" href="/settings">
          <ion-icon :icon="cogOutline" />
          <ion-label>{{ getLine('tabs.settings') }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>
