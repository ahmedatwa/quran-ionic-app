import { instance } from "@/axios";

export const useBlob = () => {
  const encodeBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  const decodeBase64toBlob = async (base64: any) => {
    return await instance({
      method: "GET",
      baseURL: "",
      responseType: "blob",
      url: base64,
    });
  };

  return { encodeBlobToBase64, decodeBase64toBlob };
};
