import { KeepAwake } from "@capacitor-community/keep-awake";

export const useKeepAwake = () => {
  const keepAwake = async () => {
    await KeepAwake.keepAwake();
  };

  const allowSleep = async () => {
    await KeepAwake.allowSleep();
  };

  const isSupported = async () => {
    const result = await KeepAwake.isSupported();
    return result.isSupported;
  };

  const isKeptAwake = async () => {
    const result = await KeepAwake.isKeptAwake();
    return result.isKeptAwake;
  };

  return {
    keepAwake,
    allowSleep,
    isSupported,
    isKeptAwake,
  };
};
