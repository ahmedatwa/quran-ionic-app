import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import Home from "@/views/Home.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/chapters",
  },
  {
    path: "/",
    component: Home,
    children: [
      {
        path: "",
        redirect: "/chapters",
      },
      {
        name: "Chapters",
        path: "chapters",
        component: () => import("@/views/tabs/ChaptersHomeTab.vue"),
        props: true,
      },
      {
        name: "Juzs",
        path: "juzs",
        component: () => import("@/views/tabs/JuzsHomeTab.vue"),
      },
      {
        name: "Pages",
        path: "pages",
        component: () => import("@/views/tabs/PagesHomeTab.vue"),
      },
      {
        name: "Bookmarks",
        path: "bookmarks",
        component: () => import("@/views/tabs/BookmarkHomeTab.vue"),
      },
      {
        name: "Settings",
        path: "/settings",
        component: () => import("@/views/tabs/SettingsHomeTab.vue"),
      },
    ],
  },
  {
    path: "/page/:pageId",
    name: "single.page",
    component: () => import("@/views/pages/Page.vue"),
    props: true,
    children: [
      {
        path: "verse/:verseId",
        name: "",
        component: () => import("@/views/pages/Page.vue"),
      },
    ],
  },
  {
    path: "/juz/:juzId",
    name: "single.juz",
    component: () => import("@/views/pages/Juz.vue"),
    props: true,
  },
  {
    path: "/chapter/:slug/:chapterId/:verseId",
    name: "single.chapter",
    component: () => import("@/views/pages/Chapter.vue"),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
