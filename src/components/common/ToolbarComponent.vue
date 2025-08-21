<script lang="ts" setup>
import { IonToolbar, IonIcon, IonButtons, IonText } from "@ionic/vue";
import { IonProgressBar, IonButton, IonTitle } from "@ionic/vue";
// composables
import { useLocale } from "@/composables/useLocale"
import { chevronBackCircleOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
const { getLine } = useLocale()
const router = useRouter()

defineProps<{
    routeBackLabel: string
    routerDirection?: "back" | "forward" | "root"
    routeBackPath?: string
    isLoading?: boolean
    pageId?: number,
    chapterId?: number
    juzId?: number
    chapterName?: string
    verseData?: {
        juzNumber: number | null;
        hizbNumber: number | null;
        pageNumber: number | null;
        surah: number;
        ayah: number
    }
}>()

</script>

<template>
    <ion-toolbar>
        <ion-buttons slot="start">
            <ion-button :router-link="routeBackPath" @click="!routeBackPath ? router.go(-1) : void (0)"
                router-direction="back">
                <ion-icon :icon="chevronBackCircleOutline"></ion-icon>
            </ion-button>
        </ion-buttons>
        <ion-title>
            <span v-if="chapterId">{{ chapterName }}</span>
            <span v-else-if="pageId">{{ getLine("quranReader.textPage") + " " + pageId }}</span>
            <span v-else-if="juzId">{{ getLine("quranReader.textJuz") + " " + juzId }}</span>
            <span v-else></span>
        </ion-title>
        <ion-buttons slot="end" v-if="verseData">
            <ion-button :disabled="true" size="small" fill="clear" color="medium">
                {{ getLine("audio.surah", [verseData?.surah]) }} /
                {{ getLine("audio.ayah", [verseData?.ayah]) }}</ion-button>
        </ion-buttons>
        <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
    </ion-toolbar>
</template>
