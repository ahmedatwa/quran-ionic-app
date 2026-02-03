<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { IonList, IonLabel, IonItem, IonSpinner, IonNote } from '@ionic/vue';
import { IonSkeletonText, IonToolbar, IonSearchbar, IonText, IonIcon } from '@ionic/vue';
import { chevronBack, chevronForward } from "ionicons/icons";
import { storeToRefs } from 'pinia';
// utils
import { localizeNumber } from '@/utils/number';
// composables
import { useLocale } from '@/composables/useLocale';
// stores
import { useJuzStore } from '@/stores/JuzStore';
import { useAudioStore } from "@/stores/AudioStore";

const inputSearchValue = shallowRef<string | null | undefined>("")
const juzStore = useJuzStore()
const { isPlaying, chapterId } = storeToRefs(useAudioStore())
const { getLine, getLocale, isRtl } = useLocale()


const props = defineProps<{
    visibleSearchBar?: boolean
    searchValue?: string | null | undefined
}>()


const juzs = computed(() => {
    if (juzStore.juzList) {
        return juzStore.juzList.filter((v) => {
            if (inputSearchValue.value?.length) {
                return v.juz_number.toLocaleString() === inputSearchValue.value
            } else {
                return v.juz_number
            }
        })
    }
});

const verseMapping = computed((): string[] | undefined => {
    if (juzStore.selectedJuz) {
        return Object.keys(juzStore.selectedJuz?.verse_mapping)
    }
})


const isAudioPlaying = (juzNumber: number) => {
    if (isPlaying.value) {
        if (juzNumber === juzStore.selectedJuz?.juz_number) {
            if (chapterId.value) {
                return verseMapping.value?.includes(chapterId.value.toString())
            }
        }
    }
}

watch(() => props.searchValue, (val) => inputSearchValue.value = val)

</script>

<template>
    <ion-toolbar v-if="visibleSearchBar">
        <ion-searchbar name="filter" @ion-input="inputSearchValue = $event.detail.value" :debounce="500"
            autocomplete="on" inputmode="text" type="text"></ion-searchbar>
    </ion-toolbar>
    <ion-list v-if="!juzs?.length">
        <ion-item v-for="n in 30" :key="n">
            <ion-skeleton-text :animated="true" style="width: 100%; height: 20px;"></ion-skeleton-text>
        </ion-item>
    </ion-list>
    <ion-list v-else>
        <ion-item :button="true" :detail="false" v-for="juz in juzs" :key="juz.id"
            :router-link="{ name: 'single.juz', params: { juzId: juz.juz_number } }">
            <ion-label>
                <ion-spinner name="dots" color="danger" class="mr-3"
                    v-if="isAudioPlaying(juz.juz_number)"></ion-spinner>
                <ion-text>{{ getLine('quranReader.textJuz') }} {{ localizeNumber(juz.juz_number, getLocale)
                }}</ion-text>
                <ion-text v-for="chapter in juz.chapters" :key="chapter.chapterId" color="medium" class="d-flex">
                    {{ chapter.en }}</ion-text>
            </ion-label>
            <div class="metadata-end-wrapper" slot="end">
                <ion-note color="medium">{{ juz.chapters?.length }}</ion-note>
                <ion-icon color="medium" :icon="isRtl ? chevronBack : chevronForward"></ion-icon>
            </div>
        </ion-item>
    </ion-list>
</template>