//  Programmer Name: Ang Jia Yue
// Program Name: Routed
//  Description: Route Planning Mobile Application
//  First written on: 10 March 2023
//  Edited on: 10 April 2023
import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import MemoriesPage from "../views/MemoriesPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/memories",
  },
  {
    path: "/memories",
    component: MemoriesPage,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
