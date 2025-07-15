// fetch.js
import { ref, toValue, computed } from "vue";
// axios
import { instance } from "@/axios";
import { audioRecitersUrl } from "@/axios/url";
// composables
import { useAlert } from "@/composables/useAlert";
import { useStorage } from "@/composables/useStorage";
import { useBlob } from "@/composables/useBlob";
// Stores
import { useChapterStore } from "@/stores/ChapterStore";
import { useRecitionsStore } from "@/stores/RecitionsStore";
// types
import type { AudioFile } from "@/types/audio";

export const useAudioFile = () => {
  const { selectedReciter } = useRecitionsStore();
  const { presentToast } = useAlert();
  const { getChapterName } = useChapterStore();
  const { encodeBlobToBase64 } = useBlob();
  const isAudioFileLoading = ref(false);
  const reciterId = toValue(selectedReciter?.id);
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

  const downloadAudioFile = async (audioFile: AudioFile) => {
    if (audioFile) {
      isAudioFileLoading.value = true;
      const audioUrl = audioFile.audio_url;
      const key = `${String(audioFile.reciterId)}-${audioFile.chapter_id}`;
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
            reciterId: String(audioFile.reciterId),
            id: audioFile.id,
            chapter_id: audioFile.chapter_id,
            file_size: audioFile.file_size,
            format: audioFile.format,
            duration: audioFile.duration,
            verse_timings: JSON.stringify(audioFile.verse_timings),
            audio_url: base64Data,
          });
        })
        .catch(async (error) => {
          await presentToast({ message: String(error) });
        })
        .finally(async () => {
          isAudioFileLoading.value = false;
        });
    } else {
      throw "Error! File Not Found.";
    }
  };

  return {
    attemptFileSave,
    saveFile,
    downloadAudioFile,
    downloadFileProgress,
    isAudioFileLoading,
  };
};
