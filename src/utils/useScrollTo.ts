export const useScrollTo = () => {
  const scrollTo = (id: string, parent: HTMLDivElement): void => {
    const el = document.querySelector(id) as HTMLDivElement;
    const elOffset = el.offsetTop;
    const winHeight = window.innerHeight;
    // const parentHeight = parent.offsetTop;
    //let halfHeight = window.innerHeight / 3;
    //const y = (elOffset - winHeight) / 3;
    const elRect = el.getBoundingClientRect();
    console.log(elRect.y, elRect.y - winHeight);

    //const y = el.getBoundingClientRect().top + window.scrollY + 100;
    const y = (elRect.y - winHeight) / 3;
    setTimeout(function () {
      window.scrollBy({ top: y, left: 0, behavior: "smooth" });
    }, 2);
  };

  const scrollToTop = (id: string): void => {
    const el = document.querySelector(id) as HTMLDivElement;
    let halfHeight = window.innerHeight / 3;
    const elOffset = el.offsetTop;
    var scrollTop = window.scrollY || el.scrollTop - (el.clientTop || 0);
    console.log(halfHeight, elOffset, scrollTop);

    window.scrollBy(100, 100);

    if (scrollTop > window.innerHeight / 3) {
    }
  };

  return { scrollToTop, scrollTo };
};
