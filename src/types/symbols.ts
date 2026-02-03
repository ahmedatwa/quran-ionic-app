import { Ref, ComputedRef, InjectionKey } from "vue";

export interface Translate {
  line: (key: string, replacement?: any[]) => string | undefined;
  setLocale: (key: string, direction: boolean) => void;
  locale: ComputedRef<string>;
  rtl: ComputedRef<boolean>;
}

export interface Options {
  [key: string]: {
    [key: string]: string | object;
  };
}

export const langKey: InjectionKey<Translate> = Symbol("Translate");

// Sidebar Keys
export interface SideBarKeys {
  isOpen: Ref<boolean>;
  menuId: "chapters" | "juzs" | "pages";
  setOpen: (value: boolean) => void;
}

export const SidebarMenuKey: InjectionKey<SideBarKeys> = Symbol("sidebarMenu");
