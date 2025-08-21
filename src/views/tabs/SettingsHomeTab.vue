<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue';
import { IonContent, IonItem, IonList, IonListHeader, IonAccordion } from '@ionic/vue';
import { IonToggle, IonPage, IonSelectOption, IonSelect, IonAccordionGroup } from "@ionic/vue"
import { IonLabel, IonText } from '@ionic/vue';
// icons
import { cogOutline } from 'ionicons/icons';
// stores
import { useAudioStore } from "@/stores/AudioStore";
import { useRecitionsStore } from '@/stores/RecitionsStore';
import { useTranslationsStore } from "@/stores/TranslationsStore";
// utils
import { _range } from '@/utils/number';
import { getLangFullLocale } from '@/utils/locale';
import { properCase } from '@/utils/string';
// composables
import { useSettings } from '@/composables/useSettings';
import { useLocale } from '@/composables/useLocale';
import { useKeepAwake } from '@/composables/useKeepAwake';
import { useAlert } from '@/composables/useAlert';
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import ModalComponent from '@/components/common/ModalComponent.vue';
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
const settings = useSettings()
const keepAwake = useKeepAwake()
const isAwake = ref(false)
const { presentAlert } = useAlert()
const loopAudio = shallowRef(false)

const handleSelectedTranslation = (transaltion: Translation) => {
    translationStore.selectedTranslation = transaltion
    settings.updateSelectedTranslations(transaltion)
}

const handleKeepAwake = async () => {
    await keepAwake.keepAwake()
    isAwake.value = await keepAwake.isKeptAwake()
}

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
        id: "present-info-alert",
        buttons: ["Close"]
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
                                    <ion-select :label="getLine('settings.fontSize')" aria-label="Quran Fonts"
                                        :placeholder="settings.getSelectedFontSize.value"
                                        :value="settings.getSelectedFontSize.value"
                                        @ion-change="settings.applyStyle('fontSize', $event)">
                                        <ion-select-option v-for="item in settings.fontSizes.value" :key="item"
                                            :value="item">{{ item }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-select :label="getLine('settings.fontFamily')" aria-label="Quran Font Family"
                                        :placeholder="settings.styles.value.fontFamily"
                                        :value="settings.styles.value.fontFamily"
                                        @ion-change="settings.applyStyle('fontFamily', $event)">
                                        <ion-select-option v-for="fg in settings.fontFamilyGroup.value" :key="fg"
                                            :value="fg">{{ fg }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-select :placeholder="settings.styles.value.fontWeight"
                                        :label="getLine('settings.boldText')" aria-label="Quran Font weight"
                                        :value="settings.styles.value.fontWeight"
                                        @ion-change="settings.applyStyle('fontWeight', $event)">
                                        <ion-select-option v-for="weight in settings.fontWeights.value" :key="weight"
                                            :value="weight">{{ weight }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-select :placeholder="settings.styles.value.wordColor"
                                        :label="getLine('settings.highlightedWordColor')"
                                        aria-label="Quran Font word color" :value="settings.styles.value.wordColor"
                                        @ion-change="settings.applyStyle('wordcolor', $event)">

                                        <ion-select-option v-for="item in settings.wordColors.value" :key="item"
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
                <modal-component :title="getLine('settings.reciters')" trigger="reciters-modal"
                    :data="recitationsStore.mapRecitions" :selected="recitationsStore.selectedReciter"
                    @update:selected-recition="recitationsStore.handleSelectedReciter">
                </modal-component>
                <ion-list-header class="ion-margin-bottom">{{ getLine("settings.translations") }}</ion-list-header>
                <ion-item button :detail="true" id="translations-modal">
                    <ion-label>{{ translationStore.selectedTranslation?.author_name }}</ion-label>
                </ion-item>
                <modal-component :title="getLine('settings.translations')"
                    :data="translationStore.groupTranslationsByLanguage" trigger="translations-modal"
                    :selected="translationStore.selectedTranslation"
                    @update:selected-translation="handleSelectedTranslation">
                </modal-component>
                <ion-list-header class="ion-margin-bottom">{{ getLine("settings.audio") }}</ion-list-header>
                <ion-accordion-group>
                    <ion-accordion value="first">
                        <ion-item slot="header">
                            <ion-label>{{ getLine("settings.audioPlayer") }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <ion-list class="ion-padding">
                                <ion-item>
                                    <ion-toggle @ion-change="audioStore.handleAudioSetting" value="autoPlay"
                                        :checked="audioStore.audioPlayerSetting.autoPlay">{{
                                            getLine("settings.autoPlay")
                                        }}</ion-toggle>
                                </ion-item>
                                <ion-item>
                                    <ion-toggle @ion-change="audioStore.handleAudioSetting" value="autoScroll"
                                        :checked="audioStore.audioPlayerSetting.autoScroll">
                                        {{ getLine("settings.autoScroll") }}</ion-toggle>
                                </ion-item>
                                <ion-item>
                                    <ion-toggle @ion-change="audioStore.handleAudioSetting" value="autoDownload"
                                        :checked="audioStore.audioPlayerSetting.autoDownload">
                                        {{ getLine("settings.autoDownload") }}</ion-toggle>
                                </ion-item>
                                <ion-item>
                                    <ion-select :label="getLine('settings.loopAudio')"
                                        :aria-label="getLine('settings.loopAudio')"
                                        :placeholder="getLine('settings.loopAudio')"
                                        @ion-change="audioStore.handleAudioSetting" :value="audioStore.audioPlayerSetting.loopAudio">
                                        <ion-select-option value="never">{{ getLine('audio.never') }}</ion-select-option>
                                        <ion-select-option value="once">{{ getLine('audio.once') }}</ion-select-option>
                                        <ion-select-option value="repeat">{{ getLine('audio.repeat')
                                            }}</ion-select-option>
                                    </ion-select>

                                </ion-item>
                                <!-- <ion-item>
                                    <ion-toggle @ion-change="audioStore.handleAudioSetting"
                                        :checked="audioStore.audioPlayerSetting.fab" value="fab">
                                        {{ getLine("settings.fab") }}</ion-toggle>
                                </ion-item> -->
                                <ion-item>
                                    <ion-toggle @ion-change="audioStore.handleAudioSetting" value="dismissOnEnd"
                                        :checked="audioStore.audioPlayerSetting.dismissOnEnd">
                                        {{ getLine("settings.playerDismiss") }}</ion-toggle>
                                </ion-item>
                                <ion-item>
                                    <ion-toggle @ion-change="handleKeepAwake" :checked="isAwake">
                                        {{ getLine("settings.keepAwake") }}</ion-toggle>
                                </ion-item>
                            </ion-list>
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
                                        :placeholder="getLocaleValue" @ion-change="settings.updateSelectedLocale">
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
                                        @ion-change="settings.appleColorScheme">
                                        <ion-select-option v-for="item in settings.colorSchemes.value" :key="item.key"
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