<template>
  <section class="intro catalog-intro">
    <div>
      <h1>{{ t(favorites ? "favorites" : "heading") }}</h1>
      <p v-if="!favorites">{{ t("intro") }}</p>
    </div>
    <label class="search-field">
      <span class="sr-only">{{ t("search") }}</span>
      <input v-model="list.search" type="search" :placeholder="t('searchExample')" @input="resetPosition">
    </label>
  </section>

  <section class="filter-bar catalog-filters" :aria-label="t('search')">
    <label>{{ t("generation") }}
      <select v-model="list.generation" :aria-label="t('generation')" @change="resetPosition">
        <option value="">{{ t("allGenerations") }}</option>
        <option v-for="(region, i) in regions" :key="region" :value="String(i + 1)">{{ region }} · {{ t("generation") }} {{ i + 1 }}</option>
      </select>
    </label>
    <label>{{ t("type") }}
      <select v-model="list.type" :aria-label="t('type')" @change="resetPosition">
        <option value="">{{ t("allTypes") }}</option>
        <option v-for="type in sortedTypes" :key="type" :value="type">{{ typeLabel(type) }}</option>
      </select>
    </label>
    <label>{{ t("sort") }}
      <select v-model="list.sort" :aria-label="t('sort')" @change="resetPosition">
        <option value="number">{{ t("number") }}</option>
        <option value="name">{{ t("name") }}</option>
      </select>
    </label>
    <label class="check retro-switch"><input v-model="retro.enabled" role="switch" type="checkbox"> {{ t("retro") }}</label>
    <div class="results-bar">
    <p role="status"><strong>{{ format(filtered.length) }}</strong> {{ t("results") }}</p>
    <div class="active-filters">
      <span v-if="list.generation" class="chip">{{ regions[Number(list.generation) - 1] }}</span>
      <span v-if="list.type" class="chip">{{ typeLabel(list.type) }}</span>
      <span v-if="list.search.trim()" class="chip">{{ list.search.trim() }}</span>
      <button v-if="hasFilters" class="text-button" type="button" @click="clearFilters">{{ t("clear") }}</button>
    </div>
    </div>
  </section>
  <p v-if="!filtered.length" class="notice">{{ favorites && !collections.favorites.length ? t("noFavorites") : t("noResults") }}</p>

  <div class="catalog-grid">
    <article v-for="entry in filtered.slice(0, list.limit)" :key="entry.slug" class="pokemon-card type-theme" :data-primary-type="entry.types[0]">
      <RouterLink class="card-link" :to="{ name: 'pokemon', params: { name: entry.slug }, query: favorites ? { from: 'favorites' } : {} }">
        <span class="entry-number">{{ formatNumber(entry.number) }}</span>
        <PokemonArt :pokemon="entry" :name="nameOf(entry)" :retro="retro.enabled" />
        <div class="card-caption">
          <h2>{{ nameOf(entry) }}</h2>
          <TypeLabels :types="entry.types" />
        </div>
      </RouterLink>
      <button class="icon-button card-favorite" type="button" :aria-pressed="isFavorite(entry)"
        :aria-label="(isFavorite(entry) ? t('unfavorite') : t('favorite')) + ' · ' + nameOf(entry)"
        @click="toggle('favorites', entry.slug)">
        <span aria-hidden="true">{{ isFavorite(entry) ? "♥" : "♡" }}</span>
      </button>
    </article>
  </div>
  <div v-if="filtered.length > list.limit" class="load-more">
    <button class="button primary" type="button" @click="list.limit += 24">{{ t("loadMore") }}</button>
    <small>{{ t("shown") }} {{ format(list.limit) }} / {{ format(filtered.length) }}</small>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted } from "vue";
import PokemonArt from "../components/PokemonArt.vue";
import TypeLabels from "../components/TypeLabels.vue";
import { entries, formatNumber, normalize, typeNames } from "../lib/pokemon";
import { format, locale, nameOf, t, typeLabel } from "../lib/i18n";
import { catalogList, collections, favoritesList, retro, toggle } from "../lib/state";

const props = defineProps({ favoritesView: Boolean });
const favorites = computed(() => props.favoritesView);
const list = computed(() => favorites.value ? favoritesList : catalogList);
const regions = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos", "Alola", "Galar", "Paldea"];
const sortedTypes = computed(() => [...typeNames].sort((a, b) => typeLabel(a).localeCompare(typeLabel(b), locale.value)));
const isFavorite = entry => collections.favorites.includes(entry.slug);
const hasFilters = computed(() => Boolean(list.value.generation || list.value.type || list.value.search || list.value.sort !== "number"));
const filtered = computed(() => {
  const query = normalize(list.value.search.trim());
  const number = query.match(/^#?\s*(\d+)$/);
  const result = entries.filter(entry =>
    (!list.value.generation || String(entry.generation) === list.value.generation) &&
    (!list.value.type || entry.types.includes(list.value.type)) &&
    (!favorites.value || isFavorite(entry)) &&
    (!query || (number ? entry.number === Number(number[1]) :
      [entry.slug, ...Object.values(entry.names)].some(name => normalize(name).includes(query)))));
  return list.value.sort === "name" ? result.sort((a, b) => nameOf(a).localeCompare(nameOf(b), locale.value)) : result;
});

function resetPosition() { list.value.limit = 24; list.value.scroll = 0; }
function clearFilters() {
  Object.assign(list.value, { search: "", generation: "", type: "", sort: "number" });
  resetPosition();
}
onBeforeUnmount(() => { list.value.scroll = window.scrollY; });
onMounted(async () => {
  await nextTick();
  window.scrollTo({ top: list.value.scroll, behavior: "auto" });
});
</script>
