import { route } from "quasar/wrappers";
import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";

export default route(() => createRouter({
  history: createWebHistory(process.env.VUE_ROUTER_BASE),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.path === from.path) return false;
    // The list restores its saved position after its cards are rendered.
    return ["catalog", "favorites"].includes(to.name) ? false : savedPosition || { top: 0 };
  },
}));
