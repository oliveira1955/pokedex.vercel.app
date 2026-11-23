<template>
  <li class="evolution-node" :class="{ 'evolution-parent': node.evolves_to.length }">
    <details v-if="rules.length" class="evolution-condition">
      <summary>{{ level ? t("level") + " " + level : t("evolutionRequirements") }}</summary>
      <ul class="evolution-rules">
        <li v-for="rule in rules" :key="rule.text">
          {{ rule.text }}<small v-if="rule.games.length"> · {{ rule.games.join(", ") }}</small>
        </li>
      </ul>
    </details>
    <RouterLink v-if="entry" class="evolution-card type-theme" replace
      :data-primary-type="entry.types[0]" :aria-current="node.species.name === currentSpecies ? 'true' : undefined"
      :to="{ name: 'pokemon', params: { name: entry.slug }, query: { from: $route.query.from } }">
      <PokemonArt :pokemon="entry" :name="nameOf(entry)" />
      <span class="evolution-identity">
        <small>{{ formatNumber(entry.number) }}</small>
        <strong>{{ nameOf(entry) }}</strong>
      </span>
      <span class="evolution-arrow" aria-hidden="true">›</span>
    </RouterLink>
    <div v-else class="evolution-card"><strong>{{ humanize(node.species.name) }}</strong></div>
    <ul v-if="node.evolves_to.length" class="evolution-branches"
      :class="{ 'evolution-fork': node.evolves_to.length > 1 }">
      <EvolutionTree v-for="child in node.evolves_to" :key="child.species.name"
        :node="child" :current-species="currentSpecies" />
    </ul>
  </li>
</template>

<script setup>
import { computed } from "vue";
import PokemonArt from "./PokemonArt.vue";
import { bySpecies, formatNumber, humanize } from "../lib/pokemon";
import { t, locale, nameOf, typeLabel } from "../lib/i18n";
import { conditions } from "../lib/evolution";
import versions from "../data/versions.json";

const props = defineProps({
  node: { type: Object, required: true },
  currentSpecies: { type: String, required: true },
});
const entry = computed(() => bySpecies.get(props.node.species.name));
const level = computed(() => {
  const options = props.node.evolution_details;
  const levels = new Set(options.map(option => option.min_level));
  return levels.size === 1 && options.every(option => option.trigger?.name === "level-up") ? options[0].min_level : null;
});
const rules = computed(() => {
  const unique = new Map();
  for (const rule of conditions(props.node.evolution_details, { language: locale.value, t, typeLabel, nameOf })) {
    if (!unique.has(rule.text)) unique.set(rule.text, { text: rule.text, games: [] });
    const game = versions[rule.game]?.map(name => name[locale.value] || name.en).filter(Boolean).join(" / ");
    if (game) unique.get(rule.text).games.push(game);
  }
  return [...unique.values()];
});
</script>

<style scoped lang="scss">
.evolution-node {
  --evolution-rail: clamp(1.2rem, 4vw, 2.2rem);
  --evolution-line: #c8d5e4;
}

.evolution-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: clamp(.55rem, 2vw, 1rem);
  min-height: 72px;
  margin-left: var(--evolution-rail);
  padding: .45rem .6rem;
  border: 1px solid var(--line);
  border-radius: 1rem;
  color: var(--ink);
  background: #f5f7fa;
  background: linear-gradient(105deg, color-mix(in srgb, var(--stage-start, #8c99ad) 15%, white), white 82%);
  text-decoration: none;
}

.evolution-card::before {
  content: "";
  position: absolute;
  left: calc(-1 * var(--evolution-rail) + 3px);
  top: 50%;
  width: 10px;
  height: 10px;
  z-index: 1;
  transform: translate(-50%, -50%);
  border: 2px solid white;
  border-radius: 50%;
  background: var(--stage-ink, #526581);
  box-shadow: 0 0 0 1px var(--stage-ink, #526581);
}

/* Continue the rail through each card, stopping at the first and last markers. */
.evolution-card::after {
  content: "";
  position: absolute;
  top: var(--rail-start, 50%);
  bottom: var(--rail-end, 50%);
  left: calc(-1 * var(--evolution-rail) + 2px);
  width: 2px;
  background: var(--evolution-line);
}

.evolution-branches > .evolution-node > .evolution-card { --rail-start: -1px; }
.evolution-parent > .evolution-card { --rail-end: -1px; }

.evolution-card[aria-current="true"],
a.evolution-card:hover {
  border-color: var(--stage-ink);
}

.evolution-card[aria-current="true"] {
  box-shadow: inset 0 0 0 1px var(--stage-ink);
}

.evolution-card .pokemon-art {
  flex: 0 0 clamp(52px, 15vw, 84px);
  height: clamp(52px, 14vw, 76px);
  border-radius: .7rem;
  background: radial-gradient(circle, #ffffffc7 0 55%, transparent 57%);
}

.evolution-card .pokemon-art :deep(img) {
  filter: drop-shadow(0 4px 4px #17213630);
}

.evolution-identity {
  display: grid;
  min-width: 0;
  gap: .05rem;
  overflow-wrap: anywhere;
}

.evolution-identity small { color: #495b71; font: 700 .75rem ui-monospace, monospace; }
.evolution-identity strong { font-size: clamp(.92rem, 3vw, 1.15rem); line-height: 1.2; }
.evolution-arrow { margin-left: auto; padding-inline: .15rem; color: var(--stage-ink); font-size: 1.5rem; }

.evolution-branches {
  position: relative;
  padding-top: .25rem;
}

.evolution-branches::before {
  content: "";
  position: absolute;
  top: 0;
  left: 3px;
  width: 2px;
  height: .25rem;
  background: var(--evolution-line);
}

.evolution-condition {
  border-left: 2px solid var(--evolution-line);
  margin-left: 3px;
  padding: .28rem 0 .3rem calc(var(--evolution-rail) - 5px);
}

.evolution-condition summary {
  display: list-item;
  width: fit-content;
  list-style-position: inside;
  max-width: 100%;
  min-height: 36px;
  padding: .42rem .75rem;
  border-radius: .65rem;
  background: #edf2f8;
  color: #344864;
  cursor: pointer;
  font-size: .8rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.evolution-rules {
  margin-top: .35rem;
  padding: .6rem .75rem;
  border-radius: .65rem;
  background: #f5f7fa;
  color: #495b71;
  font-size: .8rem;
  overflow-wrap: anywhere;
}

.evolution-rules li + li { margin-top: .35rem; }
.evolution-rules small { font-size: .75rem; }

.evolution-fork {
  margin-left: 3px;
  padding: .25rem 0 0 clamp(.38rem, 2vw, 1rem);
  border-left: 2px solid var(--evolution-line);
}

.evolution-fork::before { content: none; }
.evolution-fork > .evolution-node + .evolution-node { margin-top: .45rem; }
</style>
