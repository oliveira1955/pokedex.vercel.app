export default [
  { path: "/", name: "catalog", component: () => import("pages/IndexPage.vue") },
  { path: "/favorites", name: "favorites", component: () => import("pages/IndexPage.vue") },
  { path: "/comparison", name: "comparison", component: () => import("pages/CollectionPage.vue") },
  { path: "/team", name: "team", component: () => import("pages/CollectionPage.vue") },
  { path: "/:name([a-zA-Z0-9-]+)", name: "pokemon", component: () => import("pages/PokemonPage.vue") },
  { path: "/:pathMatch(.*)*", name: "missing", component: () => import("pages/ErrorNotFound.vue") },
];
