<script setup lang="ts">
import { shallowRef } from "vue"
import { IonList, IonItem, IonToggle, IonSelect } from '@ionic/vue';
import { IonSelectOption, IonLabel } from '@ionic/vue';
// composables
import { useLocale } from '@/composables/useLocale';
import { useKeepAwake } from '@/composables/useKeepAwake';
//types
import type { AudioPlayerSettings } from '@/types/audio';

const keepAwake = useKeepAwake()
const isAwake = shallowRef(false)
const { getLine } = useLocale()

defineProps<{
    audioPlayerSetting: AudioPlayerSettings
}>()
defineEmits<{
    "update:audioPlayerSettings": [value: CustomEvent]
}>()

const handleKeepAwake = async () => {
    await keepAwake.keepAwake()
    isAwake.value = await keepAwake.isKeptAwake()
}


</script>

<template>
    <ion-list class="ion-padding" :inset="true">
        <ion-item>
            <ion-label>{{ getLine("settings.autoPlay") }}
                <p>{{ getLine("settings.autoPlayInfo") }}</p>
            </ion-label>
            <ion-toggle @ion-change="$emit('update:audioPlayerSettings', $event)" value="autoPlay"
                :checked="audioPlayerSetting?.autoPlay" slot="end"></ion-toggle>
        </ion-item>
        <ion-item>
            <ion-label>{{ getLine("settings.autoScroll") }}
                <p>{{ getLine("settings.autoScrollInfo") }}</p>
            </ion-label>
            <ion-toggle @ion-change="$emit('update:audioPlayerSettings', $event)" value="autoScroll"
                :checked="audioPlayerSetting?.autoScroll" slot="end">
            </ion-toggle>
        </ion-item>
        <ion-item>
            <ion-label>{{ getLine("settings.tooltip") }}
                <p>{{ getLine("settings.tooltipInfo") }}</p>
            </ion-label>
            <ion-toggle @ion-change="$emit('update:audioPlayerSettings', $event)" value="tooltip"
                :checked="audioPlayerSetting?.tooltip" slot="end">
            </ion-toggle>
        </ion-item>
        <ion-item>
            <ion-label> {{ getLine("settings.autoDownload") }}
                <p>{{ getLine("settings.autoDownloadInfo") }}</p>
            </ion-label>
            <ion-toggle @ion-change="$emit('update:audioPlayerSettings', $event)" value="autoDownload"
                :checked="audioPlayerSetting?.autoDownload" slot="end">
            </ion-toggle>
        </ion-item>
        <ion-item>
            <ion-select :label="getLine('settings.loopAudio')" :aria-label="getLine('settings.loopAudio')"
                :placeholder="getLine('settings.loopAudio')" @ion-change="$emit('update:audioPlayerSettings', $event)"
                :value="audioPlayerSetting?.loopAudio">
                <ion-select-option value="never">{{ getLine('audio.never')
                }}</ion-select-option>
                <ion-select-option value="once">{{ getLine('audio.once') }}</ion-select-option>
                <ion-select-option value="repeat">{{ getLine('audio.repeat')
                }}</ion-select-option>
            </ion-select>

        </ion-item>
        <ion-item>
            <ion-label> {{ getLine("settings.fab") }}
                <p>{{ getLine("settings.fabInfo") }}</p>
            </ion-label>
            <ion-toggle @ion-change="$emit('update:audioPlayerSettings', $event)" :checked="audioPlayerSetting?.fab"
                value="fab" slot="end">
            </ion-toggle>
        </ion-item>
        <ion-item>
            <ion-label> {{ getLine("settings.playerDismiss") }}
            </ion-label>
            <ion-toggle @ion-change="$emit('update:audioPlayerSettings', $event)" value="dismissOnEnd"
                :checked="audioPlayerSetting?.dismissOnEnd" slot="end">
            </ion-toggle>
        </ion-item>
         <ion-item>
            <ion-label> {{ getLine("settings.confirmClosePlayer") }}
            </ion-label>
            <ion-toggle @ion-change="$emit('update:audioPlayerSettings', $event)" value="confirmClosePlayer"
                :checked="audioPlayerSetting?.confirmClosePlayer" slot="end">
            </ion-toggle>
        </ion-item>
        <ion-item>
            <ion-label>{{ getLine("settings.playAllJuz") }}
                <p>{{ getLine("settings.playAllJuzInfo") }}</p>
            </ion-label>
            <ion-toggle @ion-change="$emit('update:audioPlayerSettings', $event)" value="playAllJuz"
                :checked="audioPlayerSetting?.playAllJuz" slot="end">
            </ion-toggle>
        </ion-item>
        <ion-item>
            <ion-label>{{ getLine("settings.keepAwake") }}
                <p>{{ getLine("settings.keepAwakeInfo") }}</p>
            </ion-label>
            <ion-toggle @ion-change="handleKeepAwake" :checked="isAwake" slot="end">
            </ion-toggle>
        </ion-item>
    </ion-list>
</template>