import { computed, onMounted, shallowRef } from "vue";

export const useScrollToElement = () => {
  const scrollMargin = shallowRef(100);
  const scrollElment = shallowRef<HTMLElement | null>(null);
  const parentElementId = shallowRef<HTMLElement | null>(null);

  const scrollToElement = async (
    elID: string,
    root: string = ".ion-page",
    timeout?: number,
    options: ScrollIntoViewOptions = SMOOTH_SCROLL_TO_CENTER
  ) => {
    parentElementId.value = root.startsWith("#")
      ? (document.querySelector(root) as HTMLElement)
      : (document.getElementById(root) as HTMLElement);

    scrollElment.value = document.querySelector(elID) as HTMLElement;

    console.log(parentElementId.value);
    console.log(scrollElment.value);
    // attempt scroll
    if (
      scrollElment.value &&
      isPVisible(scrollElment.value, parentElementId.value)
    ) {
       await delay(100);
       
      console.log("point");
      
      scrollElment.value.scrollIntoView(options)
    } else {
      return scrollElment.value;
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

  const isPVisible = (element: Element, container: Element) => {
    const elRect = element.getBoundingClientRect();
    const conRect = container.getBoundingClientRect();

    let result = false;

    if (
      elRect.x >= conRect.x &&
      elRect.y >= conRect.y &&
      elRect.x + elRect.width <= conRect.x + conRect.width &&
      elRect.y + elRect.height <= conRect.y + conRect.height
    ) {
      result = true;
    }
    return result;
  };

  /**
   *
   * @param {HTMLElement} ele
   * @return {{top: number, left: number}}
   */
  const getElOffset = (ele: HTMLElement | string) => {
    let element: HTMLElement =
      typeof ele === "string" ? (document.querySelector(ele) as HTMLElement) : ele;
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

  // const elementIsVisibleInViewport = (
  //   el: Element,
  //   parentElement: Element,
  //   partiallyVisible: boolean = false
  // ) => {
  //   const { top, left, bottom, right } = el.getBoundingClientRect();
  //   const { clientHeight, clientWidth } = parentElement;
  //   return partiallyVisible
  //     ? ((top > 0 && top < innerHeight) || (bottom > 0 && left < innerWidth)) &&
  //         ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
  //     : top >= 0 && left >= 0 && bottom <= clientHeight && right <= clientWidth;
  // };

  // const getMainScrollElRect = (elID: string): string => {
  //   const div = elID.replace("#", "#main-");
  //   const el = document.querySelector(div) as HTMLDivElement;
  //   if (el) {
  //     return el.getBoundingClientRect().height.toString();
  //   }
  //   return "250";
  // };

  onMounted(() => {
    console.log("scroll mounted");
    
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
