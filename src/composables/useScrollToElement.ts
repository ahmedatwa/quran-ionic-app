import { computed, onMounted, onUnmounted, shallowRef } from "vue";

export const SMOOTH_SCROLL_TO_CENTER = {
  block: "center", // 'block' relates to vertical alignment. see: https://stackoverflow.com/a/48635751/1931451 for nearest.
  behavior: "smooth",
} as ScrollIntoViewOptions;

export const SMOOTH_SCROLL_TO_TOP = {
  block: "start",
  behavior: "smooth",
} as ScrollIntoViewOptions;

export const SCROLL_TO_NEAREST_ELEMENT = {
  block: "nearest",
} as ScrollIntoViewOptions;

export const useScrollToElement = () => {
  const scrollMargin = shallowRef(120);
  const scrollElment = shallowRef<HTMLElement | null>(null);
  const parentElementId = shallowRef<HTMLElement | null>(null);

  const scrollToElement = async (
    elID: string,
    root: string = ".ion-page",
    timeout?: number,
    options: ScrollIntoViewOptions = SMOOTH_SCROLL_TO_CENTER
  ) => {
    // const el = shallowRef<HTMLDivElement | null>();
    parentElementId.value =
      typeof root === "string"
        ? (document.querySelector(root) as HTMLElement)
        : root;

    scrollElment.value = document.querySelector(elID) as HTMLElement;

    // return if same verse el was sent
    // if (
    //   scrollElment.value === (document.querySelector(elID) as HTMLElement) &&
    //   isInViewport.value
    // ) {
    //   return;
    // }

    // attempt scroll
    if (scrollElment.value && !isInViewport.value) {
      if (timeout) await delay(timeout);
      scrollElment.value.classList.add(`scroll-margin:${scrollMargin.value}px`);
      scrollElment.value.scrollIntoView(options);
    } else {
      return;
    }
  };

  const isInViewport = computed(() => {
    let rect = scrollElment.value?.getBoundingClientRect();
    let parentValue = parentElementId.value
      ? parentElementId.value
      : document.documentElement;
    if (rect) {
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || parentValue.clientHeight) &&
        rect.right <= (window.innerWidth || parentValue.clientWidth)
      );
    }
  });

  /**
   *
   * @param {HTMLElement} el
   * @return {{top: number, left: number}}
   */
  const getElOffset = (el: HTMLElement | string) => {
    let element: HTMLElement =
      typeof el === "string" ? (document.querySelector(el) as HTMLElement) : el;
    let top = 0,
      left = 0;
    // offsetParent = 0;
    while (element !== null) {
      top += element.offsetTop;
      left += element.offsetLeft;
      // offsetParent = element.offsetParent;
    }
    return { top, left };
  };

  const scrollIfNeeded = (
    element: HTMLDivElement,
    container: HTMLDivElement
  ) => {
    if (element.offsetTop < container.scrollTop) {
      container.scrollTop = element.offsetTop;
    } else {
      const offsetBottom = element.offsetTop + element.offsetHeight;
      const scrollBottom = container.scrollTop + container.offsetHeight;
      if (offsetBottom > scrollBottom) {
        container.scrollTop = offsetBottom - container.offsetHeight;
      }
    }
  };

  const getMainScrollElRect = (elID: string): string => {
    const div = elID.replace("#", "#main-");
    const el = document.querySelector(div) as HTMLDivElement;
    if (el) {
      return el.getBoundingClientRect().height.toString();
    }
    return "250";
  };

  const delay = (length: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (length) {
          resolve();
        } else {
          reject();
        }
      }, length);
    });
  };

  onUnmounted(() => {});
  onMounted(() => {
    scrollElment.value = null;
    parentElementId.value = null;
  });
  return {
    scrollToElement,
    scrollIfNeeded,
    getElOffset,
    isInViewport,
  };
};
