<script setup lang="ts">
import { onMounted } from 'vue';
import { IonApp, IonRouterOutlet, IonContent } from '@ionic/vue';
// stores
import { useMetaStore } from '@/stores/MetaStore';
import { useSettingStore } from '@/stores/SettingStore';
// utils
import { getStorage, setStorage } from '@/utils/storage';


const metaStore = useMetaStore()
const settingStore = useSettingStore()

onMounted(() => {
  const colorScheme = getStorage("color-scheme")
  if (colorScheme) {
    switch (colorScheme) {
      case "auto":
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        settingStore.paletteToggle = prefersDark.matches;
        document.documentElement.classList.toggle('ion-palette-dark', prefersDark.matches);
        break;
      case "dark":
        settingStore.paletteToggle = true
        window.matchMedia(`(prefers-color-scheme: dark)`);
        document.documentElement.classList.toggle('ion-palette-dark', true);
        break;
      case "light":
        settingStore.paletteToggle = false
        window.matchMedia(`(prefers-color-scheme: light)`);
        document.documentElement.classList.toggle('ion-palette-dark', false);
        break;
      default:
        break;
    }
  } else {
    setStorage("color-scheme", "auto")
  }
})


</script>

<template>
  <teleport to="head title">{{ metaStore.pageTitle }}</teleport>
  <teleport to="head">
    <meta v-for="(metaItem, i) in metaStore.metaData" :key="i" :name="metaItem.name" :property="metaItem.property"
      :content="metaItem.content">
  </teleport>
  <ion-app>
    <ion-content class="ion-padding" fixed-slot-placement="before">
      <ion-router-outlet />
    </ion-content>
  </ion-app>
</template>
