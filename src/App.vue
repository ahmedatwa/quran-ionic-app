<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { IonApp, IonRouterOutlet, IonContent } from '@ionic/vue';
import { App } from '@capacitor/app';
// composables
import { useMetaData } from '@/composables/useMetaData';
import { useStartup } from "@/composables/useStartup"
// utils
import AudioHtmlElComponent from "@/components/audio/AudioHtmlElComponent.vue";

const { metaData, pageTitle } = useMetaData()
const { run, appState } = useStartup()

onBeforeMount(async () => {
  await run()
})

App.addListener('appStateChange', ({ isActive }) => {
  appState.value = isActive
});

</script>

<template>
  <teleport to="#title">{{ pageTitle }}</teleport>
  <teleport to="head">
    <meta v-for="(item, index) in metaData" :key="index" :name="item.name" :property="item.property"
      :content="item.content">
  </teleport>
  <ion-app>
    <ion-content class="ion-padding" fixed-slot-placement="before">
      <audio-html-el-component></audio-html-el-component>
      <ion-router-outlet></ion-router-outlet>
    </ion-content>
  </ion-app>
</template>
