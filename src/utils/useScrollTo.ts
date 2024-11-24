export const useScrollTo = () => {
  const scrollTo = (id: string, parent: HTMLDivElement): void => {
    const el = document.querySelector(id) as HTMLDivElement;
    const elOffset = el.offsetTop;
    const winHeight = window.innerHeight;
    const parentHeight = parent.offsetTop;
    const y = (elOffset - winHeight) / 2;
    console.log(y);
    console.log(id);

    window.scrollTo(0, y);
  };

  const scrollToTop = (): void => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  return { scrollToTop, scrollTo };
};
