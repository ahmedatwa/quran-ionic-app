<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useAudioStore } from "@/stores/AudioStore";

const audioPlayerRef = ref<HTMLAudioElement>()
const audioStore = useAudioStore()

onMounted(() => audioStore.audioEl = audioPlayerRef.value)

</script>
<template>
    <div class="d-none">
        <audio controls :autoplay="audioStore.audioPlayerSetting?.autoPlay" ref="audioPlayerRef"
            :src="audioStore.audioFiles?.audio_url" :id="`chapter-${audioStore.audioFiles?.chapter_id}`"
            :type="`audio/${audioStore.audioFiles?.format}`" @pause="audioStore.playbackPaused"
            @ended="audioStore.playbackEnded" @playing="audioStore.playbackPlaying"
            @timeupdate="audioStore.playbackListener" @canplaythrough="audioStore.canPlayThrough"
            @loadeddata="audioStore.loadedData" @loadedmetadata="audioStore.loadMetaData"
            @seek="audioStore.playbackSeek">
        </audio>
    </div>
</template>