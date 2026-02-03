<script setup lang="ts">

import { IonToolbar, IonHeader, IonMenu } from '@ionic/vue';
import { IonButton, IonContent, IonIcon } from '@ionic/vue';
import { chevronBackCircleOutline } from 'ionicons/icons';

// components
import AllChaptersListComponent from "@/components/chapter/AllChaptersListComponent.vue"
//composables
import { useLocale } from '@/composables/useLocale';

const { getLine } = useLocale()

defineProps<{
    contentId: string
    menuId: string
}>()

</script>
<template>
    <ion-menu :content-id="contentId" :menu-id="menuId" type="push" key="chapters-men" ref="menuRef">
        <ion-header>
            <ion-toolbar>
                <ion-button router-link="/chapters" router-direction="back" fill="clear">
                    <ion-icon :icon="chevronBackCircleOutline" slot="start"></ion-icon>
                    {{ getLine("buttons.back") }}
                </ion-button>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <all-chapters-list-component visibleSearchBar></all-chapters-list-component>
        </ion-content>
    </ion-menu>
</template>