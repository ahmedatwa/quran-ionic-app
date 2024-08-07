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
        path: "chapters",
        component: () => import("@/views/tabs/ChaptersHomeTab.vue"),
        props: true,
      },
      {
        path: "juzs",
        component: () => import("@/views/tabs/JuzsHomeTab.vue"),
      },
      {
        path: "pages",
        component: () => import("@/views/tabs/PagesHomeTab.vue"),
      },
      {
        path: "bookmarks",
        component: () => import("@/views/tabs/BookmarkHomeTab.vue"),
      },
      {
        path: "/settings",
        component: () => import("@/views/tabs/SettingsHomeTab.vue"),
      },
    ],
  },
  {
    path: "/page/:pageId",
    component: () => import("@/views/pages/Page.vue"),
    props: true,
  },
  {
    path: "/juz/:juzId",
    component: () => import("@/views/pages/Juz.vue"),
    props: true,
  },
  {
    path: "/chapter/:chapterId",
    component: () => import("@/views/pages/Chapter.vue"),
    props: true,
  },
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
