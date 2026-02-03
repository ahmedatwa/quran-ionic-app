<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue';
import { IonContent, IonItem, IonList, IonListHeader, IonAccordion } from '@ionic/vue';
import { IonPage, IonSelectOption, IonSelect, IonAccordionGroup } from "@ionic/vue"
import { IonLabel, IonText, IonButton, IonButtons, IonIcon } from '@ionic/vue';
// icons
import { add, cogOutline, remove } from 'ionicons/icons';
// stores
import { useAudioStore } from "@/stores/AudioStore";
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useTranslationsStore } from "@/stores/TranslationsStore";
import { useSettingsStore } from '@/stores/SettingsStore';
// utils
import { _range } from '@/utils/number';
import { getLangFullLocale } from '@/utils/locale';
import { properCase } from '@/utils/string';
// composables
import { useLocale } from '@/composables/useLocale';
import { useAlert } from '@/composables/useAlert';
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import RecitationsListModalComponent from '@/components/setting/RecitationsListModalComponent.vue';
import TranslationListModalComponent from '@/components/setting/TranslationListModalComponent.vue';
import AudioPlayerSettingsComponent from '@/components/setting/AudioPlayerSettingsComponent.vue';
// types
import type { Recitations } from '@/types/audio';
import type { Translation } from '@/types/translations';


const audioStore = useAudioStore()
const recitationsStore = useRecitionsStore()
const { getLine, getLocaleKey, supportedLocales, getLocale, getLocaleValue } = useLocale()
const translationStore = useTranslationsStore()
const appVersion = computed(() => import.meta.env.VITE_APP_VERSION)
const colorScheme = ref("auto")
const pageRef = ref(null)
const settingsStore = useSettingsStore()
const { presentAlert } = useAlert()

const presentCacheAlert = async () => {
    await presentAlert({
        header: "Note",
        message: getLine('settings.cacheNote'),
        buttons: [{
            text: getLine('buttons.cancel'),
        }, {
            text: getLine('buttons.clear'),
            role: getLine('buttons.clear'),
            handler: () => {
                audioStore.clearAudioStoragecache()
            }
        }],
        id: "clear-cache-alert"
    })
}

const aboutApp = async () => {
    await presentAlert({
        header: "Nobel Quran",
        message: getLine("quranReader.introSubtitle"),
        id: "present-app-info-alert",
        buttons: ["Close"],
    })
}



</script>

<template>
    <ion-page ref="pageRef">
        <header-component :title="getLine('settings.title')" :icon="cogOutline" :is-loading="false"
            :search="false"></header-component>
        <ion-content :fullscreen="true">
            <div class="ion-padding">
                <ion-list-header class="ion-margin-bottom">{{ getLine('settings.appearance') }}</ion-list-header>
                <ion-accordion-group value="first">
                    <ion-accordion value="first">
                        <ion-item slot="header">
                            <ion-label>{{ getLine("settings.fontStyle") }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <ion-list class="ion-padding">
                                <ion-item>
                                    <ion-label>{{ getLine('settings.quranFontSize') }}</ion-label>
                                    <ion-buttons slot="end">
                                        <ion-button @click="settingsStore.setFontSize('quran', 'remove')"
                                            :disabled="settingsStore.styles.quranFontSize === 1"><ion-icon
                                                :icon="remove" slot="icon-only"></ion-icon></ion-button>
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
                                <ion-item>
                                    <ion-select :label="getLine('settings.quranFontFamily')"
                                        aria-label="Quran Font Family"
                                        :placeholder="settingsStore.styles.quranFontFamily"
                                        :value="settingsStore.styles.quranFontFamily" @ion-change="settingsStore.setFontFamily('quran',
                                            $event)">
                                        <ion-select-option v-for="fg in settingsStore.fontFamilyGroup" :key="fg"
                                            :value="fg">{{ fg }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <!-- <ion-item>
                                    <ion-select :label="getLine('settings.translationFontFamily')"
                                        aria-label="Translation Font Family"
                                        :placeholder="settingsStore.styles.translationFontFamily"
                                        :value="settingsStore.styles.translationFontFamily" @ion-change="settingsStore.setFontFamily('translation',
                                            $event)">
                                        <ion-select-option v-for="fg in settingsStore.fontFamilyGroup" :key="fg"
                                            :value="fg">{{ fg }}</ion-select-option>
                                    </ion-select>
                                </ion-item> -->
                                <ion-item>
                                    <ion-select :placeholder="settingsStore.styles.fontWeight"
                                        :label="getLine('settings.boldText')" aria-label="Quran Font weight"
                                        :value="settingsStore.styles.fontWeight" @ion-change="settingsStore.setFontWight">
                                        <ion-select-option v-for="weight in settingsStore.fontWeights" :key="weight"
                                            :value="weight">{{ weight }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-select :placeholder="settingsStore.styles.wordColor"
                                        :label="getLine('settings.highlightedWordColor')"
                                        aria-label="Quran Font word color" :value="settingsStore.styles.wordColor"
                                        @ion-change="settingsStore.setWordColor">
                                        <ion-select-option v-for="item in settingsStore.wordColors" :key="item"
                                            :value="item"> {{ item }}
                                        </ion-select-option>
                                    </ion-select>
                                </ion-item>
                            </ion-list>
                        </div>
                    </ion-accordion>
                </ion-accordion-group>
                <ion-list-header class="ion-margin-bottom">{{ getLine("settings.reciters") }}</ion-list-header>
                <ion-item button :detail="true" id="reciters-modal">
                    <ion-label>{{ recitationsStore.selectedReciter?.name }}</ion-label>
                </ion-item>
                <!-- reciters Modal -->
                <recitations-list-modal-component trigger="reciters-modal"
                    :map-recitions="recitationsStore.mapRecitions" :selected-reciter="recitationsStore.selectedReciter"
                    @update:selected-recition="recitationsStore.handleSelectedReciter">
                </recitations-list-modal-component>
                <ion-list-header class="ion-margin-bottom">{{ getLine("settings.translations") }}</ion-list-header>
                <ion-item button :detail="true" id="translations-modal">
                    <ion-label>{{ translationStore.selectedTranslation?.author_name }}</ion-label>
                </ion-item>
                <translation-list-modal-component :translations-map="translationStore.groupTranslationsByLanguage"
                    trigger="translations-modal" :selected-translation="translationStore.selectedTranslation"
                    @update:selected-translation="translationStore.handleSelectedTranslation">
                </translation-list-modal-component>
                <ion-list-header class="ion-margin-bottom">{{ getLine("settings.audio") }}</ion-list-header>
                <ion-accordion-group>
                    <ion-accordion value="first">
                        <ion-item slot="header">
                            <ion-label>{{ getLine("settings.audioPlayer") }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <audio-player-settings-component
                                @update:audio-player-settings="audioStore.handleAudioSetting"
                                :audio-player-setting="audioStore.audioPlayerSetting">
                            </audio-player-settings-component>
                        </div>
                    </ion-accordion>
                </ion-accordion-group>
                <ion-list-header class="ion-margin-bottom">{{ getLine("settings.device") }}</ion-list-header>
                <ion-accordion-group>
                    <ion-accordion value="first">
                        <ion-item slot="header">
                            <ion-label>{{ getLine("settings.system") }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <ion-list class="ion-padding">
                                <ion-item>
                                    <ion-select :label="getLine('settings.language')" :value="getLocaleKey"
                                        :aria-label="getLine('settings.language')" interface="popover"
                                        :placeholder="getLocaleValue" @ion-change="settingsStore.updateSelectedLocale">
                                        <ion-select-option :value="locale" v-for="locale in supportedLocales"
                                            :key="locale.key">{{ locale.value }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-label>{{ getLine('settings.locale') }}</ion-label>
                                    <ion-text>{{ getLangFullLocale(getLocale) }}</ion-text>
                                </ion-item>
                            </ion-list>
                        </div>
                    </ion-accordion>
                    <ion-accordion value="system">
                        <ion-item slot="header">
                            <ion-label>{{ getLine("settings.app") }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <ion-list class="ion-padding">
                                <ion-item>
                                    <ion-select :aria-label="getLine('settings.darkMode')"
                                        :label="getLine('settings.theme')" :placeholder="properCase(colorScheme)"
                                        @ion-change="settingsStore.appleColorScheme">
                                        <ion-select-option v-for="item in settingsStore.colorSchemes" :key="item.key"
                                            :value="item.key">{{ item.value }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-label>{{ getLine('settings.version') }}</ion-label>
                                    <ion-text>{{ appVersion }}</ion-text>
                                </ion-item>
                                <ion-item @click="aboutApp" :button="true">
                                    <ion-label>{{ getLine('settings.about') }}</ion-label>
                                </ion-item>
                                <ion-item :button="true" @click="presentCacheAlert">
                                    <ion-label>{{ getLine('settings.cache') }}</ion-label>
                                    <ion-text></ion-text>
                                </ion-item>
                            </ion-list>
                        </div>
                    </ion-accordion>
                </ion-accordion-group>
            </div>
        </ion-content>
    </ion-page>
</template>
<style scoped>
ion-item {
    --transition: none;
}

.small-font {
    font-size: x-small;
}

ion-accordion {
    margin: 0 auto;
}

.codeColorBlock_R_PT {
    border: 1px solid #0000001a;
    border-radius: 4px;
    display: inline-block;
    height: 20px;
    margin-right: 2px;
    width: 20px;
}
</style>