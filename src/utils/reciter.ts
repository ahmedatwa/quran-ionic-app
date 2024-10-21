import type { Recitations } from "@/types/audio";

export const getAllRecitations = (): Promise<Recitations[]> => {
  return new Promise((resolve, reject) => {
    try {
      import("@/json/reciters.json").then((res) => resolve(res.reciters));
    } catch (error) {
      reject(error);
    }
  });
};

export const getReciterById = async (id: number) => {
  return await getAllRecitations().then((response) => {
    return response.find((res) => res.id === id);
  });
};
