<script setup lang="ts">
import { computed, inject, watchEffect } from 'vue';
import { IonToolbar, IonHeader, IonMenu, menuController } from '@ionic/vue';
import { IonButton, IonContent, IonIcon } from '@ionic/vue';
import { chevronBackCircleOutline } from 'ionicons/icons';

// components
import AllChaptersListComponent from "@/components/chapter/AllChaptersListComponent.vue"
import AllPagesListComponent from "@/components/page/AllPagesListComponent.vue"
import AllJuzsListComponent from "@/components/juz/AllJuzsListComponent.vue"
//composables
import { useLocale } from '@/composables/useLocale';
import { onBeforeRouteUpdate } from 'vue-router';
//types
import { SidebarMenuKey } from "@/types/symbols"

const { getLine } = useLocale()
const siedbarMenuInjection = inject(SidebarMenuKey)

defineProps<{
  contentId: string
  routeBackPath: string
}>()

watchEffect(async () => {
  if (siedbarMenuInjection?.isOpen.value) {
    await menuController.open(siedbarMenuInjection?.menuId);
  }
})

onBeforeRouteUpdate(async (r) => {
  await closeMenu()
})

const activecomponent = computed(() => {
  if (siedbarMenuInjection?.menuId === 'chapters') {
    return AllChaptersListComponent
  } else if (siedbarMenuInjection?.menuId === 'juzs') {
    return AllJuzsListComponent
  } else {
    return AllPagesListComponent
  }
})

const closeMenu = async () => {
  await menuController.close(siedbarMenuInjection?.menuId)
  siedbarMenuInjection?.setOpen(false)
}

</script>
<template>
  <ion-menu :content-id="contentId" :menu-id="siedbarMenuInjection?.menuId" type="push" :key="`${contentId}`"
    ref="menuRef" @ion-will-close="closeMenu">
    <ion-header>
      <ion-toolbar>
        <ion-button :router-link="routeBackPath" router-direction="back" fill="clear">
          <ion-icon :icon="chevronBackCircleOutline" slot="start"></ion-icon>
          {{ getLine("buttons.back") }}
        </ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <component :is="activecomponent" visibleSearchBar></component>
    </ion-content>
  </ion-menu>
</template>