<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { IonContent, IonItem, IonList, IonListHeader, IonAccordion, IonAccordionGroup } from '@ionic/vue';
import { IonToggle, IonPage, IonSelectOption, IonSelect } from "@ionic/vue"
import { IonLabel, IonText } from '@ionic/vue';
// stores
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";
import { useTranslationsStore } from "@/stores/TranslationsStore";
// utils
import { useStorage } from '@/utils/useStorage';
import { useLocale } from '@/utils/useLocale';
import { _range } from '@/utils/number';
import { getLangFullLocale } from '@/utils/locale';
// components
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import ModalComponent from '@/components/common/ModalComponent.vue';
// icons
import { cogOutline } from 'ionicons/icons';
// types
import type { Recitations } from '@/types/audio';
import type { Translation } from '@/types/translations';
import type { AudioPlayerSettings } from "@/types/audio"

const audioPlayerStore = useAudioPlayerStore()
const { getLine, getLocaleValue, supportedLocales, setLocale, getLocale } = useLocale()
const translationStore = useTranslationsStore()
const { getStorage, setStorage } = useStorage("__settingsdb")
const appVersion = computed(() => import.meta.env.VITE_APP_VERSION)
const colorScheme = ref("auto")
const pageRef = ref(null)


const emit = defineEmits<{
    "update:styles": [value: { fontSize: number | string, fontFamily: string, fontWeight: string | number }]
}>()


// Color Schemes
const colorSchemes = ref([
    { key: "dark", value: getLine('settings.dark') },
    { key: "light", value: getLine('settings.light') },
    { key: "auto", value: getLine('settings.auto') },
])
// Audio
const audioSettings = ref<AudioPlayerSettings>({
    autoPlay: true,
    dismissOnEnd: true,
    autoScroll: true,
})
// Styles
const styles = ref({
    fontSize: "1",
    fontFamily: "Noto-Kufi",
    fontWeight: "400"
})

const fontWeights = ref([400, 500, 600, 700, 800]);
const fontFamilyGroup = ref([
    "Amiri",
    "Noto-Kufi",
    "Hafs-Nastaleeq",
    "Uthman-Taha-Naskh",
]);

const appleColorScheme = (ev: CustomEvent) => {
    const value = ev.detail.value
    document.documentElement.classList.toggle('ion-palette-dark', value === 'dark' ? true : false);
    colorScheme.value = value
    setStorage("colorScheme", value);
};

const applyFontSize = async (ev: CustomEvent) => {
    styles.value.fontSize = ev.detail.value
    emit("update:styles", styles.value)
    await setStorage("styles", styles);
}

const applyFontFamily = (ev: CustomEvent) => {
    styles.value.fontFamily = ev.detail.value
    emit("update:styles", styles.value)
    setStorage("styles", styles);
}

const applyFontWeight = (ev: CustomEvent) => {
    styles.value.fontWeight = ev.detail.value
    emit("update:styles", styles.value)
    setStorage("styles", styles);
}

const handleSelectedReciter = (reciter: Recitations) => {
    audioPlayerStore.selectedReciter = reciter
}

const handleSelectedTranslation = (transaltion: Translation) => {
    translationStore.selectedTranslation = transaltion

}

const handleAudioSetting = (ev: CustomEvent) => {
    const audio = ev.detail
    if (audio.value === "autoPlay") {
        audioSettings.value.autoPlay = audio.checked
    } else if (audio.value === "dismissOnEnd") {
        audioSettings.value.dismissOnEnd = audio.checked
    }
    else if (audio.value === "autoScroll") {
        audioSettings.value.autoScroll = audio.checked
    }
    setStorage("audio", audioSettings)
}

const updateSelectedLocale = (ev: CustomEvent) => {
    const selected = ev.detail.data.values
    const localKeys = supportedLocales.value.map((lo) => lo.key)
    if (localKeys.includes(selected.key)) {
        selected.rtl ? document.documentElement.dir = "rtl" : document.documentElement.dir = "ltr";
        setLocale(selected.key, selected.rtl)
        setStorage("locale", selected.key)
    }
}


onMounted(async () => {
    // styles
    const stylesStorage = await getStorage("styles")
    if (stylesStorage) styles.value = stylesStorage
    // Audio
    const audioStorage = await getStorage("audio")
    if (audioStorage) audioSettings.value = audioStorage
    // color scheme 
    const scheme = await getStorage("colorScheme")
    if (scheme) colorScheme.value = scheme

})


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
                                    <ion-select :label="getLine('settings.fontSize')" :placeholder="styles.fontSize"
                                        @ion-change="applyFontSize">
                                        <ion-select-option :value="n" v-for="n in 10" :key="n">{{ n
                                            }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-select :label="getLine('settings.fontFamily')" :placeholder="styles.fontFamily"
                                        @ion-change="applyFontFamily">
                                        <ion-select-option :value="n" v-for="n in fontFamilyGroup" :key="n">
                                            {{ n }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-select :placeholder="styles.fontWeight" :label="getLine('settings.boldText')"
                                        @ion-change="applyFontWeight">
                                        <ion-select-option v-for="weight in fontWeights" :key="weight">
                                            {{ weight }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                            </ion-list>
                        </div>
                    </ion-accordion>
                </ion-accordion-group>
                <ion-list-header class="ion-margin-bottom">{{ getLine("settings.reciters") }}</ion-list-header>
                <ion-item button id="reciters-modal">
                    <ion-label>{{ audioPlayerStore.selectedReciter?.name }}</ion-label>
                </ion-item>
                <!-- reciters Modal -->
                <modal-component :title="getLine('settings.reciters')" trigger="reciters-modal"
                    :data="audioPlayerStore.mapRecitions" :selected="audioPlayerStore.selectedReciter"
                    @update:selected-recition="handleSelectedReciter">
                </modal-component>
                <ion-list-header class="ion-margin-bottom">{{ getLine("settings.translations") }}</ion-list-header>
                <ion-item button id="translations-modal">
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
                                    <ion-toggle @ion-change="handleAudioSetting" value="autoPlay"
                                        :checked="audioSettings.autoPlay">{{
                                            getLine("settings.autoPlay")
                                        }}</ion-toggle>
                                </ion-item>
                                <ion-item>
                                    <ion-toggle @ion-change="handleAudioSetting" value="dismissOnEnd"
                                        :checked="audioSettings.dismissOnEnd">{{
                                            getLine("settings.playerDismiss") }}</ion-toggle>
                                </ion-item>
                                <ion-item>
                                    <ion-toggle @ion-change="handleAudioSetting" value="autoScroll"
                                        :checked="audioSettings.autoScroll">{{
                                            getLine("settings.autoScroll") }}</ion-toggle>
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
                                        <ion-select-option v-for="item in colorSchemes" :key="item.key"
                                            :value="item.key">{{ item.value
                                            }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-label>{{ getLine('settings.version') }}</ion-label>
                                    <ion-text>{{ appVersion }}</ion-text>
                                </ion-item>
                                <!-- <ion-item>
                                    <ion-label>{{ getLine('settings.cache') }}</ion-label>
                                    <ion-text>ss{{ appCache }}</ion-text>
                                </ion-item> -->
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
</style>