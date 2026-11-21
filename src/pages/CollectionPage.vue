<template>
  <section class="intro">
    <div>
      <h1>{{ t(isTeam ? "team" : "compare") }}</h1>
      <p>{{ t(isTeam ? "teamEmpty" : "compareEmpty") }}</p>
    </div>
    <label v-if="members.length < limit" class="search-field">
      <span>{{ t("selectPokemon") }}</span>
      <select :aria-label="t('selectPokemon')" :value="''" @change="add($event.target.value)">
        <option value="" disabled>{{ t("selectPokemon") }}</option>
        <option v-for="entry in options" :key="entry.slug" :value="entry.slug">{{ formatNumber(entry.number) }} · {{ nameOf(entry) }}</option>
      </select>
    </label>
  </section>

  <div class="member-grid" :class="{ 'comparison-grid': !isTeam }">
    <article v-for="entry in members" :key="entry.slug" class="pokemon-card type-theme" :data-primary-type="entry.types[0]">
      <RouterLink class="card-link" :to="{ name: 'pokemon', params: { name: entry.slug }, query: { from: kind } }">
        <span class="entry-number">{{ formatNumber(entry.number) }}</span>
        <PokemonArt :pokemon="entry" :name="nameOf(entry)" :retro="retro.enabled" />
        <div class="card-caption"><h2>{{ nameOf(entry) }}</h2><TypeLabels :types="entry.types" /></div>
      </RouterLink>
      <button class="icon-button card-favorite" type="button" :aria-label="t('remove') + ' · ' + nameOf(entry)"
        @click="toggle(kind, entry.slug)">×</button>
    </article>
  </div>

  <section v-if="!isTeam && members.length === 2" class="panel">
    <h2>{{ t("stats") }}</h2>
    <p v-if="status === 'loading'" role="status">{{ t("loading") }}</p>
    <p v-else-if="status === 'error'" role="alert">{{ t("error") }} <button class="button" type="button" @click="compare">{{ t("retry") }}</button></p>
    <div v-else-if="comparison.length" class="table-wrap">
      <table>
        <thead><tr>
          <th scope="col">{{ t("stats") }}</th>
          <th v-for="entry in members" :key="entry.slug" scope="col">{{ nameOf(entry) }}</th>
          <th scope="col">{{ t("difference") }} (2 − 1)</th>
        </tr></thead>
        <tbody>
          <tr v-for="row in comparison" :key="row.stat">
            <th scope="row">{{ t(row.stat) }}</th>
            <td>{{ format(row.first) }}</td><td>{{ format(row.second) }}</td>
            <td>{{ format(row.second - row.first, { signDisplay: "exceptZero" }) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section v-if="isTeam && members.length" class="panel">
    <div class="help-heading"><h2>{{ t("coverage") }}</h2><TermHelp :label="t('coverage')" :text="t('coverageNote')" /></div>
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th scope="col">{{ t("type") }}</th><th scope="col">{{ t("weak") }}</th>
          <th scope="col">{{ t("resist") }}</th><th scope="col">{{ t("immune") }}</th><th scope="col">{{ t("neutral") }}</th>
        </tr></thead>
        <tbody>
          <tr v-for="row in defensive" :key="row.type">
            <th scope="row"><TypeLabels :types="[row.type]" /></th>
            <td>{{ format(row.weak) }}</td><td>{{ format(row.resist) }}</td>
            <td>{{ format(row.immune) }}</td><td>{{ format(row.neutral) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import PokemonArt from "../components/PokemonArt.vue";
import TermHelp from "../components/TermHelp.vue";
import TypeLabels from "../components/TypeLabels.vue";
import { bySlug, coverage, entries, formatNumber, getResource } from "../lib/pokemon";
import { format, nameOf, t } from "../lib/i18n";
import { collections, retro, toggle } from "../lib/state";

const route = useRoute();
const isTeam = computed(() => route.name === "team");
const kind = computed(() => isTeam.value ? "team" : "comparison");
const limit = computed(() => isTeam.value ? 6 : 2);
const members = computed(() => collections[kind.value].map(slug => bySlug.get(slug)));
const options = computed(() => entries.filter(entry => !collections[kind.value].includes(entry.slug)));
const comparison = ref([]);
const status = ref("loading");
let requestId = 0;

function add(slug) { if (slug) toggle(kind.value, slug); }

async function compare() {
  const id = ++requestId;
  comparison.value = [];
  if (isTeam.value || members.value.length !== 2) return;
  status.value = "loading";
  try {
    const [first, second] = await Promise.all(members.value.map(entry => getResource("pokemon/" + entry.slug)));
    if (id !== requestId) return;
    const otherStats = new Map(second.stats.map(row => [row.stat.name, row.base_stat]));
    comparison.value = first.stats.filter(row => otherStats.has(row.stat.name)).map(row => ({
      stat: row.stat.name, first: row.base_stat, second: otherStats.get(row.stat.name),
    }));
    status.value = "ready";
  } catch { if (id === requestId) status.value = "error"; }
}
watch([isTeam, members], compare, { immediate: true });

const defensive = computed(() => {
  const totals = new Map();
  for (const entry of members.value) {
    for (const { type, damage } of coverage(entry.types)) {
      if (!totals.has(type)) totals.set(type, { type, weak: 0, resist: 0, immune: 0, neutral: 0 });
      totals.get(type)[damage === 0 ? "immune" : damage < 1 ? "resist" : damage > 1 ? "weak" : "neutral"]++;
    }
  }
  return [...totals.values()].sort((a, b) => b.weak - a.weak);
});
</script>
