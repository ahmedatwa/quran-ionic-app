import { shallowRef, readonly, computed } from "vue";

export interface MetaData {
  name?: string;
  property?: string;
  content: string;
}

export const useMetaData = () => {
  const _mainTitle = shallowRef("");
  const _metaData = shallowRef<MetaData[]>([]);
  const metaData = readonly(_metaData);

  const _title = computed(() => {
    if (_mainTitle.value) {
      return import.meta.env.VITE_APP_TITLE + " - " + _mainTitle.value;
    }
    return import.meta.env.VITE_APP_TITLE;
  });
  const pageTitle = readonly(_title);
  /**
   *
   * @param v string
   * @returns void
   */
  const setPageTitle = (v: string) => (_mainTitle.value = v);
  /**
   *
   * @param v MetaData[]
   * @returns void
   */
  const setMetaData = (v: MetaData[]) => (_metaData.value = v);

  return {
    setPageTitle,
    setMetaData,
    pageTitle,
    metaData,
  };
};
