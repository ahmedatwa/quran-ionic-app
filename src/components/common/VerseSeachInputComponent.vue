<script setup lang="ts">
import { ref } from "vue"
import { IonInput } from '@ionic/vue';
import { closeCircleOutline } from "ionicons/icons";

const input = ref()

const props = defineProps<{
    verseCount?: number
}>()

const emit = defineEmits<{
    "update:searchValue": [value: string]
}>()

const handleVerseSearch = (val: string) => {
    emit('update:searchValue', String(val))
}

const validateInput = (val: string | number) => {
    return Number(val) < Number(props.verseCount) + 1
}

const validate = (ev: CustomEvent) => {
    const value = ev.detail.value;
    input.value.$el.classList.remove('ion-valid');
    input.value.$el.classList.remove('ion-invalid');

    if (validateInput(value)) {
        input.value.$el.classList.add('ion-valid')
        handleVerseSearch(value)
    } else {
        input.value.$el.classList.add('ion-invalid');
    }

}

const markTouched = () => {
    input.value.$el.classList.add('ion-touched');
}

</script>
<template>
    <ion-input ref="input" error-text="Invalid Verse Number" @ion-blur="markTouched" :animated="true"
        placeholder="Verse Number" @ion-input="validate" autocomplete="on" inputmode="numeric" type="number"
        :min="1" :clear-input="true" :clear-input-icon="closeCircleOutline"></ion-input>
</template>