<script setup lang="ts">
import { onBeforeMount, watch } from 'vue';
import { IonApp, IonRouterOutlet, IonContent } from '@ionic/vue';
// stores
import { useMetaStore } from '@/stores/MetaStore';
// utils
import { useStorage } from '@/utils/useStorage';
import { useLocale } from "@/utils/useLocale"


const metaStore = useMetaStore()
const { setLocale, isRtl } = useLocale()
const { getStorage, setStorage } = useStorage("__settingsDB")

onBeforeMount(async () => {
  const colorScheme = await getStorage("colorScheme")
  if (colorScheme) {
    switch (colorScheme) {
      case "auto":
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        document.documentElement.classList.toggle('ion-palette-dark', prefersDark.matches);
        break;
      case "dark":
        window.matchMedia(`(prefers-color-scheme: dark)`);
        document.documentElement.classList.toggle('ion-palette-dark', true);
        break;
      case "light":
        window.matchMedia(`(prefers-color-scheme: light)`);
        document.documentElement.classList.toggle('ion-palette-dark', false);
        break;
      default:
        break;
    }
  } else {
    setStorage("colorScheme", "auto")
  }
  // Audio Setting
  const audioSettings = await getStorage("audioSettings")
  if (!audioSettings) {
    setStorage("audioSettings", {
      autoPlay: true,
      dismissOnEnd: true,
      autoScroll: true,
      autoDownload: true,
    })
  }
  // Styles
  const stylesSettings = await getStorage("styles")
  if (!stylesSettings) {
    setStorage("styles", {
      fontSize: "1",
      fontFamily: "noto-kufi",
      fontWeight: "normal",
    })
  }

  const localeStorage = await getStorage("locale")
  if (!localeStorage) {
    setLocale("en", false)
    setStorage("locale", { key: "en", rtl: false })
  } else {
    setLocale(localeStorage.key, localeStorage.rtl)
  }
})

watch(isRtl, (rtl) => {
  rtl ? document.documentElement.dir = "rtl" : document.documentElement.dir = "ltr"
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
