<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonContent, IonHeader, IonItem, IonList, IonListHeader, IonAccordion, IonAccordionGroup } from '@ionic/vue';
import { IonToggle, IonToolbar, IonPage, IonTitle, IonSelectOption, IonSelect } from "@ionic/vue"
import { IonLabel, IonText } from '@ionic/vue';
import type { ToggleCustomEvent, SelectChangeEventDetail } from '@ionic/vue';
// stores
import { useSettingStore } from "@/stores/SettingStore";
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";
import { useTranslationsStore } from "@/stores/TranslationsStore";
// utils
import { setStorage } from "@/utils/storage";
import { useLocale } from '@/utils/useLocale';
import { _range } from '@/utils/number';
import { getLangFullLocale } from '@/utils/locale';

const settingStore = useSettingStore()
const audioPlayerStore = useAudioPlayerStore()
const { getLine, getLocaleValue, supportedLocales, setLocale, getLocale } = useLocale()
const translationStore = useTranslationsStore()
const appVersion = computed(() => import.meta.env.VITE_APP_VERSION)
const colorScheme = computed(() => {
    if (settingStore.paletteToggle) {
        return "dark"
    } else {
        return "light"
    }
})

const appleColorScheme = (ev: CustomEvent) => {
    const value = ev.detail.value
    const shouldAdd = value === 'dark' ? true : false
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
    setStorage("color-scheme", value);
};

const applyFontSize = (ev: CustomEvent) => {
    const fontValue = ev.detail.value
    settingStore.cssVars.quranFrontSize = fontValue
}

const applyFontFamily = (ev: CustomEvent) => {
    const fontValue = ev.detail.value
    settingStore.cssVars.quranFontFamily = fontValue
}

const applyFontWeight = (ev: CustomEvent) => {
    const fontValue = ev.detail.value
    settingStore.cssVars.fontWeight = fontValue
}

const handleSelectedReciter = (ev: CustomEvent) => {
    const reciter = ev.detail.value
    audioPlayerStore.selectedReciter = reciter
}

const handleAudioSetting = (ev: CustomEvent) => {
    const audio = ev.detail

    if (audio.value === "autoPlay") {
        audioPlayerStore.audioPlayerSetting.autoPlay = audio.checked
    } else if (audio.value === "dismissOnEnd") {
        audioPlayerStore.audioPlayerSetting.dismissOnEnd = audio.checked
    }
}

const updateSelectedLocale = (ev: CustomEvent) => {
    const selected = ev.detail.data.values
    const localKeys = supportedLocales.value.map((lo) => lo.key)
    if (localKeys.includes(selected.key)) {
        selected.rtl ? document.documentElement.dir = "rtl" : document.documentElement.dir = "ltr";
        setLocale(selected.key, selected.rtl)
    }
}

</script>

<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title>{{ getLine('settings.title') }}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">{{ getLine('settings.title') }}</ion-title>
                </ion-toolbar>
            </ion-header>
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
                                    <ion-select :label="getLine('settings.boldText')"
                                        :placeholder="String(settingStore.cssVars.quranFrontSize)"
                                        @ion-change="applyFontSize">
                                        <ion-select-option :value="n" v-for="n in 10" :key="n">{{ n
                                            }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-select :label="getLine('settings.fontFamily')"
                                        :placeholder="settingStore.cssVars.quranFontFamily"
                                        @ion-change="applyFontFamily">
                                        <ion-select-option :value="n" v-for="n in settingStore.fontFamilyGroup"
                                            :key="n">
                                            {{ n }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-select :placeholder="String(settingStore.cssVars.fontWeight)"
                                        :label="getLine('settings.boldText')" @ion-change="applyFontWeight">
                                        <ion-select-option v-for="weight in settingStore.fontWeights" :key="weight">
                                            {{ weight }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                            </ion-list>
                        </div>
                    </ion-accordion>
                </ion-accordion-group>
                <ion-list-header class="ion-margin-bottom">{{ getLine("settings.reciters") }}</ion-list-header>
                <ion-accordion-group value="first">
                    <ion-accordion value="first">
                        <ion-item slot="header">
                            <ion-label>{{ getLine("settings.audioPlayer") }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <ion-list class="ion-padding">

                                <ion-item>
                                    <ion-select :label="getLine('settings.reciters')"
                                        @ion-change="handleSelectedReciter"
                                        :placeholder="audioPlayerStore.selectedReciter.name">
                                        <ion-select-option v-for="reciter in audioPlayerStore.recitations"
                                            :key="reciter.id" :value="reciter">{{ reciter.name }} - {{
                                                reciter.style.name }}
                                        </ion-select-option>
                                    </ion-select>
                                </ion-item>
                            </ion-list>
                        </div>
                    </ion-accordion>
                </ion-accordion-group>
                <ion-list-header class="ion-margin-bottom">{{ getLine("settings.translations") }}</ion-list-header>
                <ion-accordion-group value="first">
                    <ion-accordion value="first">
                        <ion-item slot="header">
                            <ion-label>{{ getLine("settings.audioPlayer") }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <ion-list class="ion-padding">
                                <ion-item>
                                    <ion-select :label="getLine('settings.translatedBy')"
                                        @ion-change="handleSelectedReciter"
                                        :placeholder="translationStore.groupedTranslationsAuthors">
                                        <ion-select-option
                                            v-for="(translation, key) in translationStore.translationsList"
                                            :key="translation.id" :value="translation.id">{{ translation.author_name }}
                                            - {{
                                                translation.language_name }}
                                        </ion-select-option>
                                    </ion-select>
                                </ion-item>
                            </ion-list>
                        </div>
                    </ion-accordion>
                </ion-accordion-group>
                <ion-list-header class="ion-margin-bottom">{{ getLine("settings.audio") }}</ion-list-header>
                <ion-accordion-group value="first">
                    <ion-accordion value="first">
                        <ion-item slot="header">
                            <ion-label>{{ getLine("settings.audioPlayer") }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <ion-list class="ion-padding">
                                <ion-item>
                                    <ion-toggle @ion-change="handleAudioSetting" value="autoPlay"
                                        :checked="audioPlayerStore.audioPlayerSetting.autoPlay">{{
                                            getLine("settings.autoPlay")
                                        }}</ion-toggle>
                                </ion-item>
                                <ion-item>
                                    <ion-toggle @ion-change="handleAudioSetting" value="dismissOnEnd"
                                        :checked="audioPlayerStore.audioPlayerSetting.dismissOnEnd">{{
                                            getLine("settings.playerDismiss") }}</ion-toggle>
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
                                    <ion-select :label="getLine('settings.language')"
                                        :aria-label="getLine('settings.language')" interface="popover"
                                        :placeholder="getLocaleValue" @ion-change="updateSelectedLocale">
                                        <ion-select-option :value="locale" v-for="locale in supportedLocales"
                                            :key="locale.key">{{
                                                locale.value }}</ion-select-option>
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
                                        :label="getLine('settings.theme')" interface="popover"
                                        :placeholder="colorScheme" @ion-change="appleColorScheme">
                                        <ion-select-option value="dark">{{ getLine('settings.dark')
                                            }}</ion-select-option>
                                        <ion-select-option value="light">{{ getLine('settings.light')
                                            }}</ion-select-option>
                                        <ion-select-option value="auto">{{ getLine('settings.auto')
                                            }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-label>{{ getLine('settings.version') }}</ion-label>
                                    <ion-text>{{ appVersion }}</ion-text>
                                </ion-item>

                            </ion-list>
                        </div>
                    </ion-accordion>
                </ion-accordion-group>
                <ion-accordion-group value="system">

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
</style>