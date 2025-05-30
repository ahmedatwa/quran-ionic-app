// fetch.js
import { ref, watchEffect, toValue, Ref, onMounted } from "vue";
import { instance } from "@/axios";
import { audioRecitersUrl } from "@/axios/url";
import type { AudioFile } from "@/types/audio";
import { useAlert } from "@/utils/useAlert";
import { useStorage } from "@/utils/useStorage";
import { useBlob } from "@/utils/useBlob";
// Stores
import { useChapterStore } from "@/stores/ChapterStore";

export const useAudioFile = (
  audioFiles: Ref<AudioFile | null>,
  selectedReciterId?: number
) => {
  const { presentToast } = useAlert();
  const { getChapterName } = useChapterStore();
  const { encodeBlobToBase64 } = useBlob();
  const isAudiFileLoading = ref(false);
  const reciterId = toValue(selectedReciterId);
  const downloadFileProgress = ref();
  const audioDB = useStorage("__audioDB");

  const attemptFileSave = async (chapterId: number | string) => {
    await instance
      .get(audioRecitersUrl(reciterId, Number(chapterId)))
      .then((response) => {
        if (response.data) {
          const file: AudioFile = response.data.audio_files[0];
          saveFile(Number(chapterId), file.audio_url, String(file.format));
        }
      })
      .catch(async (error) => {
        await presentToast({ message: String(error) });
      });
  };
  const saveFile = (
    chapterId: number,
    url: string,
    format: string = "audio/mp3"
  ) => {
    instance
      .get(url, { responseType: "blob" })
      .then((response) => {
        const blob = new Blob([response.data], { type: `audio/${format}` });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const chapterName = getChapterName(chapterId);
        if (chapterName) {
          link.download = chapterName?.nameSimple;
        } else {
          link.download = String(chapterId);
        }

        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch(async (error) => {
        await presentToast({ message: String(error) });
      });
  };

  const downloadAudioFile = async () => {
    isAudiFileLoading.value = true;
    if (audioFiles.value) {
      const audioUrl = audioFiles.value.audio_url;
      const key = `${String(audioFiles.value.reciterId)}-${
        audioFiles.value.chapter_id
      }`;
      await instance
        .get(audioUrl, {
          responseType: "blob",
          onDownloadProgress: async (progressEvent) => {
            const { loaded, total } = progressEvent;
            if (total)
              downloadFileProgress.value = Math.round((loaded * 100) / total);
          },
        })
        .then(async (response) => {
          const base64Data = (await encodeBlobToBase64(
            response.data
          )) as string;
          audioDB.setStorage(key, {
            reciterId: String(audioFiles.value?.reciterId),
            id: audioFiles.value?.id,
            chapter_id: audioFiles.value?.chapter_id,
            file_size: audioFiles.value?.file_size,
            format: audioFiles.value?.format,
            duration: audioFiles.value?.duration,
            verse_timings: JSON.stringify(audioFiles.value?.verse_timings),
            audio_url: base64Data,
          });
        })
        .catch(async (error) => {
          await presentToast({ message: String(error) });
        })
        .finally(async () => {
          isAudiFileLoading.value = false;
        });
    }
  };

  return { attemptFileSave, saveFile, downloadAudioFile, downloadFileProgress };
};
