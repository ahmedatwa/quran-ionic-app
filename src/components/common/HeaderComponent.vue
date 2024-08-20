<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle, IonSearchbar } from "@ionic/vue";
import { IonIcon, IonLabel, IonProgressBar } from "@ionic/vue";
// icons
import { documentOutline, cogOutline, bookOutline, newspaperOutline } from 'ionicons/icons';
import { useLocale } from "@/utils/useLocale";

const { isRtl } = useLocale()

defineProps<{
    title: string
    isLoading?: boolean
    search: boolean;
    collapse?: "condense" | "fade"
    translucent?: boolean
    searchPlaceholder?: string;
    icon: typeof documentOutline | typeof bookOutline | typeof newspaperOutline | typeof cogOutline
}>()

const emit = defineEmits<{
    "update:searchValue": [value: string]
}>()

const handleInput = (ev: CustomEvent) => {
    emit("update:searchValue", ev.detail.value)

}

</script>
<template>
    <ion-header :translucent="translucent" :collapse="collapse">
        <ion-toolbar>
            <ion-title size="large" class="ion-margin">
                <ion-icon :icon="icon" size="large"></ion-icon>
                <ion-label :class="isRtl ? 'header-label-rtl' : 'header-label'">{{ title }}</ion-label>
            </ion-title>
        </ion-toolbar>
        <ion-toolbar v-if="search">
            <ion-searchbar @ion-input="handleInput" :animated="true" :placeholder="searchPlaceholder"
                autocomplete="on" inputmode="text" type="text"></ion-searchbar>
            <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
        </ion-toolbar>
    </ion-header>
</template>
<style scoped>
.header-label {
    position: absolute;
    top: 0px;
    margin-left: 5px;
}

.header-label-rtl {
    position: absolute;
    top: 3px;
    margin-right: 5px;
}

#network-toast .toast-message {
    text-align: center;
}
</style>