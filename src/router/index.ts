import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import Home from "@/views/Home.vue";
import { loadingController } from "@ionic/vue";
import { ref } from "vue";

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
    name: "page",
    component: () => import("@/views/pages/Page.vue"),
    props: true,
  },
  {
    path: "/juz/:juzId",
    name: "juz",
    component: () => import("@/views/pages/Juz.vue"),
    props: true
  },
  {
    path: "/chapter/:chapterId",
    name: "chapter",
    component: () => import("@/views/pages/Chapter.vue"),
    props: true,
  },
  // will match everything and put it under `route.params.pathMatch`
  // { path: "/:pathMatch(.*)*", name: "NotFound", component: import("@/views/404NotFound.vue") },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const loader = ref<HTMLIonLoadingElement>();
router.beforeEach(async (to, from, next) => {
  // Loading
  loader.value = await loadingController.create({
    message: "Loading...",
  });

  loader.value.present();

  next();
});
router.afterEach(() => {
  loader.value?.dismiss();
});

export default router;
