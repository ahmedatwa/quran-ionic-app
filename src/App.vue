<script setup lang="ts">
import { onBeforeMount, shallowRef } from 'vue';
import { IonApp, IonRouterOutlet, IonContent } from '@ionic/vue';
import { App } from '@capacitor/app';
// stores
import { useMetaData } from '@/composables/useMetaData';
// utils
import AudioHtmlElComponent from "@/components/audio/AudioHtmlElComponent.vue";
// startup
import { useStartupScript } from "@/startup/useStartupScript"

const { metaData, pageTitle } = useMetaData()
const { run } = useStartupScript()
const appState = shallowRef(false)

onBeforeMount(async () => {
  await run()
})

App.addListener('appStateChange', ({ isActive }) => {
  appState.value = isActive
});

</script>

<template>
  <teleport to="head title">{{ pageTitle }}</teleport>
  <teleport to="head">
    <meta v-for="(item, index) in metaData" :key="index" :name="item.name" :property="item.property"
      :content="item.content">
  </teleport>
  <ion-app>
    <ion-content class="ion-padding" fixed-slot-placement="before">
      <audio-html-el-component :app-state="appState"></audio-html-el-component>
      <ion-router-outlet></ion-router-outlet>
    </ion-content>
  </ion-app>
</template>
