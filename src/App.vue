<template>
  <a class="skip" href="#main-content">{{ t("skip") }}</a>
  <header class="topbar">
    <div class="shell topbar-inner">
      <RouterLink class="brand" :to="{ name: 'catalog' }">
        <span class="ball" aria-hidden="true"></span> Pokédex
      </RouterLink>
      <nav :aria-label="t('catalog')">
        <RouterLink :to="{ name: 'catalog' }"><span class="nav-icon" aria-hidden="true">▦</span>{{ t("catalog") }}</RouterLink>
        <RouterLink :to="{ name: 'favorites' }"><span class="nav-icon" aria-hidden="true">♥</span>{{ t("favorites") }} <small>{{ collections.favorites.length }}</small></RouterLink>
        <RouterLink :to="{ name: 'comparison' }"><span class="nav-icon" aria-hidden="true">⇄</span>{{ t("compare") }} <small>{{ collections.comparison.length }}/2</small></RouterLink>
        <RouterLink :to="{ name: 'team' }"><span class="nav-icon" aria-hidden="true">♧</span>{{ t("team") }} <small>{{ collections.team.length }}/6</small></RouterLink>
      </nav>
      <select v-model="locale" :aria-label="t('language')">
        <option v-for="(label, code) in languages" :key="code" :value="code">{{ label }}</option>
      </select>
    </div>
  </header>
  <main id="main-content" class="shell content" tabindex="-1">
    <IndexPage v-if="catalogView" :key="catalogView" :favorites-view="catalogView === 'favorites'" />
    <RouterView v-if="!catalogView || route.name === 'pokemon'" :key="route.name" />
  </main>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import IndexPage from "./pages/IndexPage.vue";
import { languages, locale, t } from "./lib/i18n";
import { collections } from "./lib/state";

const route = useRoute();
const catalogView = computed(() => {
  if (route.name === "pokemon") return route.query.from === "favorites" ? "favorites" : "catalog";
  return ["catalog", "favorites"].includes(route.name) ? route.name : null;
});
</script>
