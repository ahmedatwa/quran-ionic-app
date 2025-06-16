<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue';
import { IonApp, IonRouterOutlet, IonContent, onIonViewDidEnter } from '@ionic/vue';
// stores
import { useMetaStore } from '@/stores/MetaStore';
// utils
import AudioHtmlElComponent from "@/components/audio/AudioHtmlElComponent.vue";
import { useStartup } from "@/startup/startup"
import { App } from '@capacitor/app';

const metaStore = useMetaStore()
const { runStartup } = useStartup()

onBeforeMount(async () => {
  await runStartup()
})

App.addListener('appStateChange', (event) => {
 console.log(event);
});

onMounted(() => {
  onIonViewDidEnter(() => {
    console.log("HomePage");
    
  })
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
      <audio-html-el-component />
      <ion-router-outlet></ion-router-outlet>
    </ion-content>
  </ion-app>
</template>
