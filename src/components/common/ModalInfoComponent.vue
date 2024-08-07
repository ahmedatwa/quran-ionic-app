<script lang="ts" setup>
import { ref } from "vue"
import { IonModal, IonText, IonLabel } from '@ionic/vue';
import { upperCase } from "@/utils/string";

const modal = ref();

defineProps<{
    text?: { title: string, body: string }[]
    trigger: string
}>()

</script>

<template>
    <ion-modal id="example-modal" ref="modal" :trigger="trigger">
        <div class="wrapper ion-padding ">
            <ion-text class="Ion-text-center" v-for="(t, index) in text" :key="index">
                <ion-label>{{ upperCase(t.title) }} : {{ t.body }}</ion-label>
            </ion-text>
        </div>
    </ion-modal>

</template>
<style scoped>
ion-modal#example-modal {
    --width: fit-content;
    --max-width: 300px;
    --height: fit-content;
    --border-radius: 6px;
    --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
}

ion-modal#example-modal h1 {
    margin: 20px 20px 10px 20px;
}

ion-modal#example-modal ion-icon {
    margin-right: 6px;
    width: 48px;
    height: 48px;
    padding: 4px 0;
    color: #aaaaaa;
}

ion-modal#example-modal .wrapper {
    margin-bottom: 10px;
}
</style>