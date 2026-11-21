import api from "../boot/axios";
import catalog from "../data/catalog.json";
import efficacy from "../data/efficacy.json";
import { readStorage, writeStorage } from "./storage";

export const entries = catalog;
export const typeNames = Object.keys(efficacy);
export const bySlug = new Map(entries.map(entry => [entry.slug, entry]));
export const bySpecies = new Map(entries.map(entry => [entry.species, entry]));
const requests = new Map();
const CACHE_KEY = "pokedex:api:v1";
const cache = readStorage(CACHE_KEY, {});
const MAX_ENTRIES = 45;
const WEEK = 7 * 86400000;

export function getResource(path) {
  const key = path.replace(/^https:\/\/pokeapi\.co\/api\/v2\//, "").replace(/^\/|\/$/g, "");
  if (cache[key] && Date.now() - cache[key].time < WEEK) return Promise.resolve(cache[key].data);
  if (!requests.has(key)) {
    requests.set(key, api.get(key + "/")
      .then(({ data }) => {
        cache[key] = { data, time: Date.now() };
        const older = Object.keys(cache).sort((a, b) => cache[b].time - cache[a].time).slice(MAX_ENTRIES);
        older.forEach(entry => delete cache[entry]);
        writeStorage(CACHE_KEY, cache);
        return data;
      })
      .finally(() => requests.delete(key)));
  }
  return requests.get(key);
}

export const formatNumber = value => "#" + String(value).padStart(3, "0");
export const humanize = value => String(value ?? "")
  .split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
export const normalize = value => value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export const slugOf = url => url.split("/").filter(Boolean).pop();

export function artwork(pokemon, { shiny = false, retro = false } = {}) {
  if (pokemon.sprites) {
    const sprites = pokemon.sprites;
    const official = sprites.other?.["official-artwork"];
    return retro ? sprites[shiny ? "front_shiny" : "front_default"] :
      official?.[shiny ? "front_shiny" : "front_default"] ??
      sprites[shiny ? "front_shiny" : "front_default"];
  }
  const root = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
  return retro ? root + pokemon.id + ".png" : root + "other/official-artwork/" + pokemon.id + ".png";
}

export function coverage(types) {
  return Object.entries(efficacy).map(([type, damages]) => ({
    type, damage: types.reduce((total, defense) => total * (damages[defense] ?? 1), 1),
  }));
}
