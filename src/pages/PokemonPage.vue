<template>
  <dialog ref="dialog" class="pokemon-dialog" :aria-label="displayName || t('profileTabs')"
    @cancel.prevent="dismiss" @click.self="dismiss">
    <div class="dialog-content">
  <div class="detail-nav">
    <small v-if="species" class="profile-counter">{{ formatNumber(species.id) }} <span> / {{ format(entries.length) }}</span></small>
    <button type="button" class="icon-button dialog-close" :aria-label="t('close')" autofocus @click="dismiss">×</button>
    <div v-if="entry" class="detail-steps">
      <RouterLink v-if="previous" class="button" :to="link(previous)" replace :aria-label="t('previous') + ' · ' + nameOf(previous)">← {{ t("previous") }}</RouterLink>
      <RouterLink v-if="next" class="button" :to="link(next)" replace :aria-label="t('next') + ' · ' + nameOf(next)">{{ t("next") }} →</RouterLink>
    </div>
  </div>
  <p v-if="status === 'loading'" class="notice" role="status">{{ t("loading") }}</p>
  <div v-else-if="status !== 'ready'" class="notice" role="alert">
    <p>{{ t(status === "missing" ? "missing" : "error") }}</p>
    <button v-if="status === 'error'" class="button" type="button" @click="load">{{ t("retry") }}</button>
  </div>

  <article v-else class="profile-shell type-theme" :data-primary-type="pokemon.types[0]?.type.name">
    <header class="profile-showcase">
      <div class="profile-meta">
        <span class="entry-number">{{ formatNumber(species.id) }}</span>
        <TypeLabels :types="pokemon.types.map(row => row.type.name)" />
      </div>
      <PokemonArt :key="pokemon.name" :pokemon="pokemon" :name="displayName" :shiny="shiny" :retro="retro.enabled" eager />
    </header>
    <div class="profile-summary">
      <div class="profile-identity">
        <div>
          <h1>{{ displayName }}</h1>
          <p>{{ summary.description }}</p>
          <p v-if="!pokemon.is_default" class="form-note">{{ t(isMega ? "mega" : "alternativeForm") }}</p>
        </div>
        <div v-if="entry && pokemon.is_default" class="action-row profile-actions">
          <button class="button profile-team" type="button" :aria-pressed="saved('team')" @click="update('team')">
            <span class="material-icons" aria-hidden="true">groups</span>
            <span>{{ t(saved("team") ? "removeTeam" : "addTeam") }}</span>
          </button>
          <button class="button profile-compare" type="button" :aria-pressed="saved('comparison')" @click="update('comparison')">
            <span class="material-icons" aria-hidden="true">swap_horiz</span>
            <span>{{ t(saved("comparison") ? "inComparison" : "addCompare") }}</span>
          </button>
          <button class="icon-button profile-favorite" type="button" :aria-pressed="saved('favorites')"
            :aria-label="t(saved('favorites') ? 'unfavorite' : 'favorite')" @click="update('favorites')">
            <span class="material-icons" aria-hidden="true">{{ saved("favorites") ? "favorite" : "favorite_border" }}</span>
          </button>
        </div>
      </div>
      <dl class="profile-facts">
        <div><dt>{{ t("height") }}</dt><dd>{{ measurement(pokemon.height, "meter") }}</dd></div>
        <div><dt>{{ t("weight") }}</dt><dd>{{ measurement(pokemon.weight, "kilogram") }}</dd></div>
        <div><dt>{{ t("classification") }}</dt><dd>{{ summary.classification }}</dd></div>
      </dl>
      <p v-if="message" role="status" class="form-note">{{ t(message) }}</p>
    </div>

    <div class="detail-sections" role="tablist" :aria-label="t('profileTabs')">
      <button v-for="section in sections" :id="'tab-' + section" :key="section" class="section-button" type="button" role="tab"
        :aria-selected="active === section" :tabindex="active === section ? 0 : -1" aria-controls="pokemon-section"
        @click="active = section" @keydown="switchTab($event, section)">{{ t(section) }}</button>
    </div>

    <section id="pokemon-section" :key="active" class="panel profile-panel" role="tabpanel" :aria-labelledby="'tab-' + active" tabindex="0">
      <template v-if="active === 'overview'">
        <dl class="overview-metrics">
          <div>
            <span class="metric-icon material-icons" aria-hidden="true">adjust</span>
            <dt>{{ t("captureRate") }}</dt><dd>{{ numeric(species.capture_rate) }}</dd>
          </div>
          <div>
            <span class="metric-icon material-icons" aria-hidden="true">star</span>
            <dt>{{ t("baseExperience") }}</dt><dd>{{ numeric(pokemon.base_experience) }}</dd>
          </div>
        </dl>
        <div class="help-heading ability-heading">
          <h3>{{ t("abilities") }}</h3><TermHelp :label="t('abilities')" :text="t('abilityHelp')" />
        </div>
        <p v-if="!pokemon.abilities.length">{{ t("missingData") }}</p>
        <div class="profile-abilities">
          <article v-for="record in pokemon.abilities" :key="record.slot" class="ability">
            <div class="ability-name">
              <h4>{{ abilityName(record.ability.name) }}</h4>
              <span v-if="record.is_hidden" class="chip ability-hidden">{{ t("hidden") }}</span>
            </div>
            <p v-if="abilities[record.ability.name]?.pending" role="status">{{ t("loading") }}</p>
            <p v-else-if="abilities[record.ability.name]?.error" role="alert">
              {{ t("error") }} <button class="button" type="button" @click="loadAbility(record.ability.name)">{{ t("retry") }}</button>
            </p>
            <p v-else>{{ abilityEffect(record.ability.name, abilities[record.ability.name]?.data) || t("missingData") }}</p>
          </article>
        </div>
      </template>

      <template v-else-if="active === 'stats'">
        <div class="help-heading"><h2>{{ t("stats") }}</h2><TermHelp :label="t('stats')" :text="t('statsHelp')" /></div>
        <div v-for="stat in pokemon.stats" :key="stat.stat.name" class="stat-row" :data-strength="stat.base_stat < 55 ? 'low' : stat.base_stat < 90 ? 'mid' : 'high'">
          <label :for="'stat-' + stat.stat.name">{{ t(stat.stat.name) }}</label>
          <strong>{{ format(stat.base_stat) }} <span>/ 255</span></strong>
          <meter :id="'stat-' + stat.stat.name" min="0" max="255" :value="stat.base_stat"></meter>
        </div>
        <div class="stat-total"><strong>{{ t("statTotal") }}</strong><span class="chip">{{ format(statTotal) }}</span></div>
      </template>

      <template v-else-if="active === 'coverage'">
        <div class="help-heading"><h2>{{ t("coverage") }}</h2><TermHelp :label="t('coverage')" :text="t('defenseHelp')" /></div>
        <dl class="defense-counts">
          <div v-for="group in defenseCounts" :key="group.key" :data-defense="group.key">
            <dt>{{ t(group.key) }}</dt><dd>{{ format(group.count) }}</dd>
          </div>
        </dl>
        <section v-for="group in visibleDefenses" :key="group.damage" class="damage-group" :data-defense="group.key">
          <h3>×{{ format(group.damage) }} · {{ t(group.key) }}</h3>
          <ul class="damage-tags"><li v-for="type in group.types" :key="type">{{ typeLabel(type) }}</li></ul>
        </section>
        <button v-if="defenseGroups.some(group => group.damage === 1)" type="button" class="text-button"
          :aria-pressed="showNeutral" @click="showNeutral = !showNeutral">{{ t(showNeutral ? "hideNeutral" : "showNeutral") }}</button>
      </template>

      <template v-else-if="active === 'evolutions'">
        <div class="help-heading"><h2>{{ t("evolutions") }}</h2><TermHelp :label="t('evolutions')" :text="t('evolutionHelp')" /></div>
        <p v-if="evolution.pending" role="status">{{ t("loading") }}</p>
        <p v-else-if="evolution.error" role="alert">{{ t("error") }} <button class="button" type="button" @click="loadEvolution">{{ t("retry") }}</button></p>
        <p v-else-if="!evolution.chain?.evolves_to.length">{{ t("noEvolutions") }}</p>
        <ul v-else class="evolution-root"><EvolutionTree :node="evolution.chain" /></ul>
      </template>

      <template v-else-if="active === 'moves'">
        <div class="help-heading"><h2>{{ t("moves") }}</h2><TermHelp :label="t('moves')" :text="t('moveHelp')" /></div>
        <PokemonMoves :moves="pokemon.moves || []" />
      </template>

      <template v-else>
        <div class="help-heading"><h2>{{ t("forms") }}</h2><TermHelp :label="t('forms')" :text="t('appearanceHelp')" /></div>
        <div class="appearance-grid">
          <button v-for="option in appearances" :key="option.label" class="appearance-tile" type="button"
            :aria-pressed="shiny === option.shiny && retro.enabled === option.retro"
            @click="retro.enabled = option.retro; shiny = option.shiny">
            <PokemonArt :pokemon="pokemon" :name="displayName" :shiny="option.shiny" :retro="option.retro" />
            <span>{{ t(option.label) }}</span>
          </button>
        </div>
        <ul v-if="species.varieties.length > 1" class="form-list">
          <li v-for="form in species.varieties.filter(option => option.pokemon.name !== pokemon.name)" :key="form.pokemon.name">
            <RouterLink class="button" replace :to="{ name: 'pokemon', params: { name: form.pokemon.name }, query: { ...route.query, section: 'forms' } }"
              >
              {{ form.is_default ? nameOf(entry || { slug: form.pokemon.name }) : humanize(form.pokemon.name) }}
              <small v-if="!form.is_default"> · {{ t(form.pokemon.name.includes('-mega') ? 'mega' : 'alternativeForm') }}</small>
            </RouterLink>
          </li>
        </ul>
      </template>
    </section>
  </article>
    </div>
  </dialog>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import EvolutionTree from "../components/EvolutionTree.vue";
import PokemonArt from "../components/PokemonArt.vue";
import PokemonMoves from "../components/PokemonMoves.vue";
import TermHelp from "../components/TermHelp.vue";
import TypeLabels from "../components/TypeLabels.vue";
import { artwork, bySpecies, coverage, entries, formatNumber, getResource, humanize } from "../lib/pokemon";
import { format, nameOf, t, typeLabel } from "../lib/i18n";
import { abilityEffect, abilityLabel, overview } from "../lib/overview";
import { collections, retro, toggle } from "../lib/state";

const route = useRoute();
const router = useRouter();
const dialog = ref(null);
let trigger;
onMounted(() => {
  trigger = document.activeElement;
  dialog.value.showModal();
});
onBeforeUnmount(() => {
  dialog.value?.close();
  if (trigger?.isConnected) trigger.focus({ preventScroll: true });
});
function dismiss() {
  const destination = router.resolve({ name: backTarget.value });
  const previous = window.history.state?.back;
  if (previous && router.resolve(previous).name === backTarget.value) router.back();
  else router.replace(destination.fullPath);
}
const sections = ["overview", "stats", "coverage", "evolutions", "moves", "forms"];
const active = ref("overview");
const status = ref("loading");
const pokemon = shallowRef(null);
const species = shallowRef(null);
const shiny = ref(false);
const showNeutral = ref(false);
const message = ref("");
const evolution = reactive({ pending: false, error: false, chain: null });
const abilities = reactive({});
let requestId = 0;

const entry = computed(() => bySpecies.get(species.value?.name));
const position = computed(() => entries.indexOf(entry.value));
const previous = computed(() => entries[position.value - 1]);
const next = computed(() => position.value < 0 ? undefined : entries[position.value + 1]);
const displayName = computed(() => pokemon.value?.is_default && entry.value ? nameOf(entry.value) : humanize(pokemon.value?.name));
const isMega = computed(() => pokemon.value?.name.includes("-mega"));
const hasShiny = computed(() => Boolean(pokemon.value && artwork(pokemon.value, { shiny: true, retro: retro.enabled })));
const summary = computed(() => overview(pokemon.value, species.value));
const statTotal = computed(() => pokemon.value.stats.reduce((total, stat) => total + stat.base_stat, 0));
const numeric = value => value == null ? "—" : format(value);
const appearances = computed(() => [
  { label: "officialArt", shiny: false, retro: false },
  { label: "shiny", shiny: true, retro: false },
  { label: "retro", shiny: false, retro: true },
].filter(option => !option.shiny || artwork(pokemon.value, option)));
const defenseGroups = computed(() => {
  const groups = new Map();
  for (const { type, damage } of coverage(pokemon.value.types.map(row => row.type.name))) {
    const key = damage > 1 ? "weak" : damage === 1 ? "neutral" : damage === 0 ? "immune" : "resist";
    if (!groups.has(damage)) groups.set(damage, { damage, key, types: [] });
    groups.get(damage).types.push(type);
  }
  return [...groups.values()].sort((a, b) => b.damage - a.damage);
});
const visibleDefenses = computed(() => defenseGroups.value.filter(group => showNeutral.value || group.damage !== 1));
const defenseCounts = computed(() => ["weak", "resist", "immune"].map(key => ({
  key, count: defenseGroups.value.filter(group => group.key === key).reduce((total, group) => total + group.types.length, 0),
})));
const backTarget = computed(() => ["favorites", "comparison", "team"].includes(route.query.from) ? route.query.from : "catalog");
const link = entry => ({ name: "pokemon", params: { name: entry.slug }, query: route.query.from ? { from: route.query.from } : {} });
const measurement = (value, unit) => value == null ? t("missingData") : format(value / 10, { style: "unit", unit });
const saved = kind => collections[kind].includes(entry.value?.slug);

function switchTab(event, section) {
  const current = sections.indexOf(section);
  const rtl = document.dir === "rtl";
  let index;
  if (event.key === "Home") index = 0;
  else if (event.key === "End") index = sections.length - 1;
  else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    const direction = (event.key === "ArrowRight") !== rtl ? 1 : -1;
    index = (current + direction + sections.length) % sections.length;
  } else return;
  event.preventDefault();
  active.value = sections[index];
  event.currentTarget.parentElement.children[index].focus({ preventScroll: true });
}

function update(kind) {
  message.value = toggle(kind, entry.value.slug) ? "" : kind === "team" ? "teamFull" : "compareFull";
}
async function load() {
  const id = ++requestId;
  status.value = "loading";
  if (dialog.value) dialog.value.scrollTop = 0;
  pokemon.value = null;
  species.value = null;
  message.value = "";
  shiny.value = false;
  Object.assign(evolution, { pending: false, error: false, chain: null });
  active.value = route.query.section === "forms" ? "forms" : "overview";
  try {
    const result = await getResource("pokemon/" + encodeURIComponent(route.params.name.toLowerCase()));
    const info = await getResource(result.species.url);
    if (id !== requestId) return;
    pokemon.value = result;
    species.value = info;
    status.value = "ready";
  } catch (error) {
    if (id === requestId) status.value = error.response?.status === 404 ? "missing" : "error";
  }
}
async function loadEvolution() {
  const url = species.value?.evolution_chain?.url;
  const id = requestId;
  if (!url || evolution.pending || evolution.chain) return;
  Object.assign(evolution, { pending: true, error: false });
  try {
    const result = await getResource(url);
    if (id === requestId) evolution.chain = result.chain;
  } catch { if (id === requestId) evolution.error = true; }
  finally { if (id === requestId) evolution.pending = false; }
}
async function loadAbility(name) {
  abilities[name] = { pending: true };
  try { abilities[name] = { data: await getResource("ability/" + name) }; }
  catch { abilities[name] = { error: true }; }
}
function abilityName(name) {
  return abilityLabel(name, abilities[name]?.data) || humanize(name);
}
watch(() => route.params.name, name => { if (name) load(); }, { immediate: true });
watch(active, section => { if (section === "evolutions") loadEvolution(); });
watch([active, pokemon], ([section, data]) => {
  if (section !== "overview" || !data) return;
  for (const { ability } of data.abilities) {
    if (!abilities[ability.name]) loadAbility(ability.name);
  }
});
watch(hasShiny, available => { if (!available) shiny.value = false; });
</script>
