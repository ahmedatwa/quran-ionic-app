<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { IonList, IonLabel, IonItem, IonSpinner, IonNote } from '@ionic/vue';
import { IonSkeletonText, IonSearchbar, IonToolbar } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
// types
import type { Chapter } from '@/types/chapter';
// utils
import { localizeNumber } from '@/utils/number';
// composables
import { useLocale } from '@/composables/useLocale';
// stores
import { useAudioStore } from "@/stores/AudioStore";
import { useChapterStore } from '@/stores/ChapterStore';


const inputSearchValue = shallowRef<string | null | undefined>("")
const { isPlaying, chapterId, audioPayLoadSrc } = storeToRefs(useAudioStore())
const { chaptersList, totalChapters } = useChapterStore()
const { getLocale, isRtl } = useLocale()
const { replace } = useRouter()

const props = defineProps<{
    visibleSearchBar?: boolean
    searchValue?: string | null | undefined
}>()

const playingState = (id: number) =>
    isPlaying.value && (id === chapterId.value) && audioPayLoadSrc.value === "chapter"

const chapters = computed((): Chapter[] | undefined => {
    if (chaptersList) {
        const searchableKeys = ["nameSimple", "nameArabic", "id"];
        return chaptersList.filter(
            (chapter: { nameSimple: string; nameArabic: string; id: number }) => {
                return searchableKeys.some((key) => {
                    if (inputSearchValue.value?.length) {
                        return chapter[key as keyof typeof chapter]
                            .toString()
                            .toLocaleLowerCase()
                            .replace(/([\-\'])/, "")
                            .includes(
                                inputSearchValue.value.toLocaleLowerCase().replace(/([\-\'])/, "")
                            );
                    } else {
                        return chapter[key as keyof typeof chapter]
                            .toString()
                            .toLocaleLowerCase()
                            .replace(/([\-\'])/, "")
                    }
                });
            }
        );
    }
});

watch(() => props.searchValue, (val) => inputSearchValue.value = val)


</script>

<template>
    <ion-toolbar v-if="visibleSearchBar">
        <ion-searchbar name="filter" @ion-input="inputSearchValue = $event.detail.value" :debounce="500"
            autocomplete="on" inputmode="text" type="text"></ion-searchbar>
    </ion-toolbar>
    <ion-list v-if="!chapters?.length">
        <ion-item v-for="n in totalChapters" :key="n">
            <ion-skeleton-text :animated="true" style="width: 100%; height: 20px;"></ion-skeleton-text>
        </ion-item>
    </ion-list>
    <ion-list v-else>
        <ion-item button detail v-for="chapter in chapters" :key="chapter.id"
            @click="replace(`/chapter/${chapter.id}`)">
            <ion-spinner name="dots" color="danger" class="ml-1" v-if="playingState(chapter.id)"></ion-spinner>
            <ion-label>{{ localizeNumber(chapter.id, getLocale) }}- {{ isRtl ? chapter.nameArabic : chapter.nameSimple
                }}
            </ion-label>
            <ion-note slot="end">{{ chapter.versesCount }}</ion-note>
        </ion-item>
    </ion-list>
</template>
<style scoped>
.ml-1 {
    margin-right: 2px;
}

ion-col {
    border: solid 1px #333;
    text-align: center;
}
</style>