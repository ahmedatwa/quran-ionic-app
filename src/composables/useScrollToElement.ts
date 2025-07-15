import { shallowRef } from "vue";

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

const elementID = shallowRef("");

export function useScrollToElement() {
  const scrollToElement = async (
    elID: string,
    root: ".ion-page",
    timeout?: 100,
    options: ScrollIntoViewOptions = SMOOTH_SCROLL_TO_CENTER
  ) => {
    const el = document.querySelector(elID) as HTMLDivElement;
    // return if same verse el was sent
    if (elementID.value === elID) {
      return;
    }
    elementID.value = elID;
    const parent =
      typeof root === "string"
        ? (document.querySelector(root) as HTMLElement)
        : root;

    const scrollMargin = getMainScrollElRect(elID);

    if (el && !isInViewport(el, parent)) {
      await delay(timeout ? timeout : 100);

      //  if (!el.classList.contains(`scroll-margin-top:${scrollMargin}px`)) {
      // el.classList.add(`scroll-margin-bottom:${scrollMargin}px`);
      el.classList.add(`scroll-margin-top:-100px`);
      //}

      el.scrollIntoView(options);
    } else {
      return;
    }
  };

  const isInViewport = (element: HTMLElement, root?: HTMLElement) => {
    let rect = element.getBoundingClientRect();
    let html = root ? root : document.documentElement;
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || html.clientHeight) &&
      rect.right <= (window.innerWidth || html.clientWidth)
    );
  };

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
    return el.getBoundingClientRect()
      ? el.getBoundingClientRect().height.toString()
      : "250";
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

  return {
    scrollToElement,
    scrollIfNeeded,
    getElOffset,
    isInViewport,
  };
}
