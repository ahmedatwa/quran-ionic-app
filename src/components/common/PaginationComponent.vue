<script setup lang="ts">
import { computed } from "vue";
import { IonButton, IonIcon, IonButtons, IonToolbar } from "@ionic/vue";
import { useRouter } from "vue-router";
// ionicons
import { chevronBackCircleOutline, chevronForwardCircleOutline } from "ionicons/icons";
import { chevronUpCircleOutline } from "ionicons/icons";
// utils
import { useJuzStore } from "@/stores/JuzStore";
import { useChapterStore } from "@/stores/ChapterStore";
import { usePageStore } from "@/stores/PageStore";
//composables
import { useLocale } from "@/composables/useLocale";

const { getLine } = useLocale()
const { totalChapters } = useChapterStore()
const { totalPages } = usePageStore()
const { totalJuzs } = useJuzStore()
const { replace } = useRouter()
const props = defineProps<{
    id?: number
    type: "chapters" | "pages" | "juzs"
    link: string;
    activeCardTopId?: string
}>()

const isNextDisabled = computed(() => {
    if (props.type === "chapters") {
        return props.id === totalChapters
    } else if (props.type === "pages") {
        return totalPages === props.id
    } else {
        return totalJuzs === props.id
    }
})

const next = computed(() => {
    if (props.id) {
        if (props.type === "chapters") {
            if (props.id < totalChapters) return props.id + 1
        } else if (props.type === "pages") {
            if (props.id < totalPages) return props.id + 1
        } else {
            if (props.id < totalJuzs) return props.id + 1
        }
    }
})


const back = computed(() => {
    let id = props.id
    if (id) {
        if (id > 1) {
            return id - 1
        }
    }
})


const nextText = computed(() => {
    if (props.id) {
        if (props.type === "chapters") {
            return getLine('quranReader.nextChapter')
        } else if (props.type === "pages") {
            return getLine('quranReader.nextPage')
        } else if (props.type === "juzs") {
            return getLine('quranReader.nextJuz')
        } else {
            return getLine('quranReader.nextPage')
        }
    }
})

const prevText = computed(() => {
    if (props.id) {
        if (props.type === "chapters") {
            return getLine('quranReader.prevChapter')
        } else if (props.type === "pages") {
            return getLine('quranReader.prevPage')
        } else if (props.type === "juzs") {
            return getLine('quranReader.prevJuz')
        } else {
            return getLine('quranReader.prevPage')
        }
    }
})

const snapUp = () => {
    if (props.activeCardTopId) {
        const el = document.querySelector(`#${props.activeCardTopId}`)
        if (el) el.scrollIntoView(true)
    } else {
        const el = document.querySelector("#verse-search-input")
        if (el) {
            el.scrollIntoView(true)
        }
    }
}
</script>
<template>
    <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
            <ion-button fill="clear" color="primary" :disabled="id === 1" @click="replace(`${link}/${back}`)">
                <ion-icon slot="end" :icon="chevronBackCircleOutline"></ion-icon>
            </ion-button>
        </ion-buttons>
        <ion-button @click="snapUp" fill="clear">
            <ion-icon :icon="chevronUpCircleOutline" color="primary"></ion-icon>
        </ion-button>
        <ion-buttons slot="end">
            <ion-button fill="clear" color="primary" :disabled="isNextDisabled" @click="replace(`${link}/${next}`)">
                <ion-icon slot="start" :icon="chevronForwardCircleOutline"></ion-icon>
            </ion-button>
        </ion-buttons>
    </ion-toolbar>
</template>
<style scoped>
ion-toolbar {
    --background: transparent !important;
}
</style>