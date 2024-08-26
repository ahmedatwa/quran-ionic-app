<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useAudioPlayerStore } from "@/stores/AudioPlayerStore";

const audioPlayerRef = ref<HTMLAudioElement>()
const audioPlayerStore = useAudioPlayerStore()

onMounted(() => audioPlayerStore.audioEl = audioPlayerRef.value)

</script>
<template>
    <div class="d-none">
        <audio controls :autoplay="audioPlayerStore.audioPlayerSetting?.autoPlay" ref="audioPlayerRef"
            :src="audioPlayerStore.audioFiles?.audio_url" :id="`chapter-${audioPlayerStore.audioFiles?.chapter_id}`"
            :type="`audio/${audioPlayerStore.audioFiles?.format}`" @pause="audioPlayerStore.playbackPaused"
            @ended="audioPlayerStore.playbackEnded" @playing="audioPlayerStore.playbackPlaying"
            @timeupdate="audioPlayerStore.playbackListener" @canplaythrough="audioPlayerStore.canPlayThrough"
            @loadeddata="audioPlayerStore.loadedData" @loadedmetadata="audioPlayerStore.loadMetaData"
            @seek="audioPlayerStore.playbackSeek">
        </audio>
    </div>
</template>