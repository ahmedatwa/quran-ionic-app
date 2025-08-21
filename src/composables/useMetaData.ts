import { shallowRef, readonly, computed } from "vue";

export interface MetaData {
  name?: string;
  property?: string;
  content: string;
}

const SEPARATOR = " - ";

const title = shallowRef("");
const meta = shallowRef<MetaData[]>([]);

export const useMetaData = () => {
  const computedTitle = computed(() => {
    return title.value.length
      ? import.meta.env.VITE_APP_TITLE + SEPARATOR + title.value
      : import.meta.env.VITE_APP_TITLE;
  });

  /**
   *
   * @param text string
   * @returns void
   */
  const setPageTitle = (text: string): void => {
    if (text.length) title.value = text;
  };
  /**
   *
   * @param arrayData MetaData[]
   * @returns void
   */
  const setMetaData = (arrayData: MetaData[]): void => {
    if (arrayData.length) meta.value = arrayData;
  };

  /**
   * readOnly
   */
  const metaData = readonly(meta);
  const pageTitle = readonly(computedTitle);

  return {
    setPageTitle,
    setMetaData,
    pageTitle,
    metaData,
  };
};
