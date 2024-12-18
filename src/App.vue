<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { IonApp, IonRouterOutlet, IonContent } from '@ionic/vue';
// stores
import { useMetaStore } from '@/stores/MetaStore';
// utils
import AudioHtmlElComponent from "@/components/audio/AudioHtmlElComponent.vue";
import { useStartup } from "@/startup/startup"

const metaStore = useMetaStore()
const { runStartup } = useStartup()

onBeforeMount(async () => {
  await runStartup()
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
