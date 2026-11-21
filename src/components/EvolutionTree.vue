<template>
  <li class="evolution-node">
    <details v-if="rules.length" class="evolution-condition">
      <summary>{{ level ? t("level") + " " + level : t("evolutionRequirements") }} <span aria-hidden="true">→</span></summary>
      <ul class="evolution-rules">
        <li v-for="rule in rules" :key="rule.text">
          {{ rule.text }}<small v-if="rule.games.length"> · {{ rule.games.join(", ") }}</small>
        </li>
      </ul>
    </details>
    <RouterLink v-if="entry" class="evolution-link" replace :to="{ name: 'pokemon', params: { name: entry.slug }, query: { from: $route.query.from } }">
      <PokemonArt :pokemon="entry" :name="nameOf(entry)" />
      <strong>{{ nameOf(entry) }}</strong><small>{{ formatNumber(entry.number) }}</small>
    </RouterLink>
    <strong v-else>{{ humanize(node.species.name) }}</strong>
    <ul v-if="node.evolves_to.length" class="evolution-branches">
      <EvolutionTree v-for="child in node.evolves_to" :key="child.species.name" :node="child" />
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

const props = defineProps({ node: { type: Object, required: true } });
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
