<script setup lang="ts">
import { IonItem, IonList, IonSelect, IonSelectOption } from '@ionic/vue';
import { useLocale } from '@/utils/useLocale';
import { upperCase } from '@/utils/string';

const { supportedLocales, getLocale } = useLocale()

const handleChange = (ev: CustomEvent) => {
    emit('update:selectedLocale', ev.detail.value);
}

const emit = defineEmits<{
    "update:selectedLocale": [value: string]
}>()



</script>

<template>
    <ion-list>
        <ion-item>
            <ion-select aria-label="Languages" :placeholder="upperCase(getLocale)" @ionChange="handleChange">
                <ion-select-option :value="locale.key" v-for="locale in supportedLocales" :key="locale.key">{{
                    locale.value }}</ion-select-option>
            </ion-select>
        </ion-item>
    </ion-list>
</template>
