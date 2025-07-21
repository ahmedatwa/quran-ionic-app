<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { IonApp, IonRouterOutlet, IonContent } from '@ionic/vue';
import { App } from '@capacitor/app';
// stores
import { useMetaStore } from '@/stores/MetaStore';
// utils
import AudioHtmlElComponent from "@/components/audio/AudioHtmlElComponent.vue";
import { useStartup } from "@/startup/startup"

const metaStore = useMetaStore()
const { runStartup } = useStartup()
const appState = ref(false)

onBeforeMount(async () => {
  await runStartup()
})

App.addListener('appStateChange', ({ isActive }) => {
  appState.value = isActive    
});



</script>

<template>
  <teleport to="head title">{{ metaStore.pageTitle }}</teleport>
  <teleport to="head">
    <meta v-for="(metaItem, i) in metaStore.metaData" :key="i" :name="metaItem.name" :property="metaItem.property"
      :content="metaItem.content">
  </teleport>
  <ion-app>
    <ion-content class="ion-padding" fixed-slot-placement="before">
      <audio-html-el-component :app-state="appState"></audio-html-el-component>
      <ion-router-outlet></ion-router-outlet>
    </ion-content>
  </ion-app>
</template>
