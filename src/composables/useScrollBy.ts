import { computed, shallowRef, toValue, type Ref } from "vue";

export const useScrollBy = () => {
  const doScrollBy = (
    item: string | Ref<string>,
    wrapper: string | Ref<string>
  ): void => {
    const itemValue = toValue(item);
    const wrapperValue = toValue(wrapper);
    const top = shallowRef(0); // extra distance from top

    const wrapperEl = computed((): HTMLDivElement | null => {
      return document.querySelector(wrapperValue);
    });

    const itemEl = computed((): HTMLDivElement | null => {
      return document.querySelector(itemValue);
    });

    const count = computed(() => {
      if (wrapperEl.value && itemEl.value)
        return itemEl.value?.offsetTop - wrapperEl.value?.scrollTop - top.value;
    }); 

    console.log("count", count.value);
      console.log("itemEl", itemEl.value);
        console.log("wrapperEl", wrapperEl.value);
        

    if (wrapperEl.value) {
      itemEl.value?.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  };

  return { doScrollBy };
};
