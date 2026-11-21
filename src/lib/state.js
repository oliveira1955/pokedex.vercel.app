import { reactive, watch } from "vue";
import { bySlug } from "./pokemon";
import { readStorage, writeStorage } from "./storage";

const stored = readStorage("pokedex:collections:v1", {});
const valid = (items, limit) => Array.isArray(items) ? [...new Set(items)].filter(slug => bySlug.has(slug)).slice(0, limit) : [];
export const collections = reactive({
  favorites: valid(stored.favorites, Infinity),
  comparison: valid(stored.comparison, 2),
  team: valid(stored.team, 6),
});
watch(collections, value => writeStorage("pokedex:collections:v1", value), { deep: true });

export function toggle(kind, slug) {
  const items = collections[kind];
  const index = items.indexOf(slug);
  if (index >= 0) { items.splice(index, 1); return true; }
  if (!bySlug.has(slug) || items.length >= ({ comparison: 2, team: 6 }[kind] ?? Infinity)) return false;
  items.push(slug);
  return true;
}

function createList(key, generation) {
  const filters = reactive({
    search: "", type: "", generation, sort: "number", limit: 24, scroll: 0,
    ...readStorage(key, {}, "sessionStorage"),
  });
  watch(filters, value => writeStorage(key, value, "sessionStorage"), { deep: true });
  return filters;
}

export const catalogList = createList("pokedex:catalog:v1", "1");
export const favoritesList = createList("pokedex:favorites:v1", "");
export const retro = reactive({ enabled: readStorage("pokedex:retro", false) });
watch(retro, value => writeStorage("pokedex:retro", value.enabled));
