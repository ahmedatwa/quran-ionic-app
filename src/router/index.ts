import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import TabsPage from "@/views/TabsPage.vue";
import { loadingController } from "@ionic/vue";
import { ref } from "vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/chapters",
  },
  {
    path: "/",
    component: TabsPage,
    children: [
      {
        path: "",
        redirect: "/chapters",
      },
      {
        path: "chapters",
        component: () => import("@/views/ChaptersTab.vue"),
        props: true,
      },
      {
        path: "juzs",
        component: () => import("@/views/JuzsTab.vue"),
        props: true,
      },

      {
        path: "pages",
        component: () => import("@/views/PagesTab.vue"),
        props: true,
      },

      {
        path: "/settings",
        component: () => import("@/views/SettingsTab.vue"),
        props: true,
      },
    ],
  },
  {
    path: "/page/:pageId",
    component: () => import("@/views/pages/PagesPage.vue"),
    props: true,
  },
  {
    path: "/juz/:juzId",
    component: () => import("@/views/pages/JuzsPage.vue"),
    props: true,
  },
  {
    path: "/chapter/:chapterId",
    component: () => import("@/views/pages/ChapterPage.vue"),
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
