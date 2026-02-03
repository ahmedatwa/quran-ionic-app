<script lang="ts" setup>
import { computed, shallowRef, inject } from "vue";
import { IonToolbar, IonIcon, IonButtons, IonLabel } from "@ionic/vue";
import { IonProgressBar, IonButton, IonTitle, menuController } from "@ionic/vue";
import { IonHeader, IonSegment, IonSegmentButton, IonModal } from '@ionic/vue';
import { IonItem, IonList, IonPopover, IonContent } from '@ionic/vue';
import { add, chevronDownOutline, menu, playCircleOutline } from "ionicons/icons";
import { options, remove } from "ionicons/icons";
// composables
import { useLocale } from "@/composables/useLocale"
import { SidebarMenuKey } from "@/types/symbols"
// stores
import { useTranslationsStore } from "@/stores/TranslationsStore";
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useSettingsStore } from "@/stores/SettingsStore";
import { useVerseTimingStore } from "@/stores/VerseTimingStore";
import { useAudioStore } from "@/stores/AudioStore";

// components
import TranslationListModalComponent from "@/components/setting/TranslationListModalComponent.vue";
import RecitationsListModalComponent from '@/components/setting/RecitationsListModalComponent.vue';
import AudioPlayerSettingsComponent from "@/components/setting/AudioPlayerSettingsComponent.vue";

const { getLine, isRtl } = useLocale()
const verseTimingStore = useVerseTimingStore()
const translationStore = useTranslationsStore()
const recitationsStore = useRecitionsStore()
const settingsStore = useSettingsStore()
const audioSettingsModal = shallowRef();
const audioStore = useAudioStore()

const siedbarMenu = inject(SidebarMenuKey)

const props = defineProps<{
    selectedSegment: string
    id: "chapters" | "juzs" | "pages"
    routeBackLabel?: string
    routerDirection?: "back" | "forward" | "root"
    routeBackPath?: string
    isLoading?: boolean
    pageId?: number,
    chapterId?: number
    juzId?: number
    chapterName?: {
        nameSimple: string | undefined,
        nameArabic: string | undefined
    }
    isPlaying?: boolean
    menuId: string
}>()


const emit = defineEmits<{
    "update:selectedSegment": [value: "translation" | "reading"]
    "update:playAllChapters": [value: boolean]
    "update:sidebarMenu": [value: boolean]
}>()

const handleSegmentChange = (ev: CustomEvent) => {
    if (ev.detail.value === "translation") {
        emit('update:selectedSegment', "translation")
    } else {
        emit('update:selectedSegment', "reading")
    }
}

const cancelAudioSettingsModal = () => audioSettingsModal.value.$el.dismiss(null, 'cancel');
const currentAudioSrc = computed(() => {
    if (props.id) {
        return props.id.slice(0, -1) as "chapter" | "juz" | "page"
    } else {
        return "chapter"
    }
})

const openMenu = async (id: string) => {
    await menuController.open(id);
}


</script>

<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="end">
                <ion-button id="popover-button"><ion-icon slot="icon-only" :icon="options"></ion-icon></ion-button>
                <ion-popover trigger="popover-button" :dismiss-on-select="false" :show-backdrop="false">
                    <ion-content>
                        <ion-list>
                            <ion-item :button="true" :detail="true" id="open-audio-settings-modal">{{
                                getLine("settings.audioPlayer")
                            }}</ion-item>
                            <ion-modal ref="audioSettingsModal" trigger="open-audio-settings-modal">
                                <ion-header>
                                    <ion-toolbar>
                                        <ion-buttons slot="start" fill="clear">
                                            <ion-button @click="cancelAudioSettingsModal()">
                                                <ion-icon :icon="chevronDownOutline" slot="icon-only"></ion-icon>
                                            </ion-button>
                                        </ion-buttons>
                                        <ion-title> {{ getLine("settings.audioPlayer") }}</ion-title>
                                    </ion-toolbar>
                                </ion-header>
                                <ion-content class="ion-padding">
                                    <audio-player-settings-component
                                        :audio-player-setting="audioStore.audioPlayerSetting"
                                        @update:audio-player-settings="audioStore.handleAudioSetting">
                                    </audio-player-settings-component>
                                </ion-content>
                            </ion-modal>
                            <ion-item :button="true" :detail="true" id="translations-modal">{{
                                getLine("settings.translations")
                            }}</ion-item>
                            <translation-list-modal-component
                                :translations-map="translationStore.groupTranslationsByLanguage"
                                trigger="translations-modal"
                                :selected-translation="translationStore.selectedTranslation"
                                @update:selected-translation="translationStore.handleSelectedTranslation">
                            </translation-list-modal-component>
                            <ion-item :button="true" :detail="true" id="reciters-modal">{{ getLine("settings.reciters")
                                }}</ion-item>
                            <!-- reciters Modal -->
                            <recitations-list-modal-component trigger="reciters-modal"
                                :map-recitions="recitationsStore.mapRecitions"
                                :selected-reciter="recitationsStore.selectedReciter"
                                @update:selected-recition="recitationsStore.handleSelectedReciter($event, currentAudioSrc)">
                            </recitations-list-modal-component>
                            <ion-item>
                                <ion-label>{{ getLine('settings.quranFontSize') }}</ion-label>
                                <ion-buttons slot="end">
                                    <ion-button @click="settingsStore.setFontSize('quran', 'remove')"
                                        :disabled="settingsStore.styles.quranFontSize === 1"><ion-icon :icon="remove"
                                            slot="icon-only"></ion-icon></ion-button>
                                    <ion-button @click="settingsStore.setFontSize('quran', 'add')"
                                        :disabled="settingsStore.styles.quranFontSize === 10"><ion-icon :icon="add"
                                            slot="icon-only"></ion-icon></ion-button>
                                </ion-buttons>
                            </ion-item>
                            <ion-item>
                                <ion-label>{{ getLine('settings.translationFontSize') }}</ion-label>
                                <ion-buttons slot="end">
                                    <ion-button @click="settingsStore.setFontSize('translation', 'remove')"
                                        :disabled="settingsStore.styles.translationFontSize === 1"><ion-icon
                                            :icon="remove" slot="icon-only"></ion-icon></ion-button>
                                    <ion-button @click="settingsStore.setFontSize('translation', 'add')"
                                        :disabled="settingsStore.styles.translationFontSize === 10"><ion-icon
                                            :icon="add" slot="icon-only"></ion-icon></ion-button>
                                </ion-buttons>
                            </ion-item>
                        </ion-list>

                    </ion-content>
                </ion-popover>
            </ion-buttons>
            <ion-segment :value="selectedSegment" @ion-change="handleSegmentChange" color="primary">
                <ion-segment-button value="translation">
                    <ion-label>{{ getLine('tabs.translations') }}</ion-label>
                </ion-segment-button>
                <ion-segment-button value="reading">
                    <ion-label>{{ getLine('tabs.reading') }}</ion-label>
                </ion-segment-button>
            </ion-segment>

        </ion-toolbar>
        <ion-toolbar>
            <ion-buttons slot="start">

                <ion-button id="menu-button" @click="openMenu(menuId)" :active="siedbarMenu?.isOpen">
                    <ion-icon slot="start" :icon="menu"></ion-icon>
                    {{ isRtl ? chapterName?.nameArabic : chapterName?.nameSimple }}
                </ion-button>





                <ion-button v-if="id === 'juzs' && !isPlaying" fill="clear"
                    @click="$emit('update:playAllChapters', true)">
                    <ion-label>{{ getLine("buttons.playAll") }}</ion-label>
                    <ion-icon :icon="playCircleOutline" slot="start"></ion-icon>
                </ion-button>
            </ion-buttons>
            <ion-title class="ion-text-center">

                <span v-if="pageId">{{ getLine("quranReader.textPage") + " " + pageId }}</span>
                <span v-else-if="juzId">{{ getLine("quranReader.textJuz") + " " + juzId }}</span>
                <span v-else></span>
            </ion-title>

            <Transition name="slide-fade">
                <ion-buttons slot="end" v-if="verseTimingStore.getCurrentVerseHeaderData">
                    <ion-button :disabled="true" size="small" fill="clear" color="medium">
                        {{ getLine("audio.surah", [verseTimingStore.getCurrentVerseHeaderData.surah]) }} /
                        {{ getLine("audio.ayah", [verseTimingStore.getCurrentVerseHeaderData.ayah]) }}</ion-button>
                </ion-buttons>
            </Transition>
            <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
        </ion-toolbar>
    </ion-header>

</template>
