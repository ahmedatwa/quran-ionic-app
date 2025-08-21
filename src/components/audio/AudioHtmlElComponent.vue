<script setup lang="ts">
import { ref, watch } from "vue"
import { useAudioStore } from '@/stores/AudioStore';

const audioRef = ref<HTMLAudioElement>()
const audioStore = useAudioStore()

watch((audioRef), (x) => {
    if (x) audioStore.audioEl = x
})

</script>
<template>
    <div v-if="audioStore.isVisible" class="d-none">
        <audio controls :autoplay="audioStore.audioPlayerSetting.autoPlay" ref="audioRef"
            :src="audioStore.audioFiles?.audio_url" :id="`chapter-${audioStore.audioFiles?.chapter_id}`"
            :type="`audio/${audioStore.audioFiles?.format}`" @pause="audioStore.playbackPaused"
            @ended="audioStore.playbackEnded" @playing="audioStore.playbackPlaying"
            @timeupdate="audioStore.playbackListener" @canplaythrough="audioStore.canPlayThrough"
            @loadeddata="audioStore.loadedData" @loadedmetadata="audioStore.loadMetaData"
            @seek="audioStore.playbackSeek">
        </audio>
    </div>
</template>