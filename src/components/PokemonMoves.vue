<template>
  <p v-if="!moveIndex && !error" role="status">{{ t("loading") }}</p>
  <div v-else-if="error" class="notice" role="alert">{{ t("error") }} <button type="button" class="button" @click="load">{{ t("retry") }}</button></div>
  <template v-else>
    <div v-if="groups.length" class="move-toolbar">
      <label>{{ t("game") }}
        <select v-model="game" :aria-label="t('game')">
          <option v-for="group in groups" :key="group" :value="group">{{ versionLabel(group) }}</option>
        </select>
      </label>
      <label>{{ t("moveSearch") }} <input v-model="search" type="search"></label>
      <label>{{ t("type") }}
        <select v-model="type" :aria-label="t('type')">
          <option value="">{{ t("allTypes") }}</option>
          <option v-for="key in types" :key="key" :value="key">{{ typeLabel(key) }}</option>
        </select>
      </label>
      <label>{{ t("category") }}
        <select v-model="category" :aria-label="t('category')">
          <option value="">{{ t("allCategories") }}</option>
          <option v-for="key in ['physical', 'special', 'status']" :key="key" :value="key">{{ t(key) }}</option>
        </select>
      </label>
    </div>
    <p v-if="!filtered.length" class="notice" role="status">{{ t("noMoves") }}</p>
    <div v-else class="table-wrap">
      <table>
        <caption>{{ t("moves") }} · {{ versionLabel(game) }}</caption>
        <thead><tr>
          <th scope="col">{{ t("name") }}</th><th scope="col">{{ t("type") }}</th><th scope="col">{{ t("category") }}</th>
          <th scope="col">{{ t("power") }}</th><th scope="col">{{ t("accuracy") }}</th><th scope="col">{{ t("method") }}</th>
        </tr></thead>
        <tbody>
          <tr v-for="move in filtered" :key="move.slug">
            <th scope="row">{{ label(move) }}</th>
            <td><TypeLabels v-if="move.type" :types="[move.type]"/><span v-else>—</span></td>
            <td>{{ move.category ? t(move.category) : "—" }}</td>
            <td>{{ move.power ? format(Number(move.power)) : "—" }}</td>
            <td>{{ move.accuracy ? format(Number(move.accuracy) / 100, { style: "percent" }) : "—" }}</td>
            <td>{{ move.methods.map(method => t(method.move_learn_method.name) +
              (method.level_learned_at > 0 ? " · " + t("level") + " " + format(method.level_learned_at) : "")).join(" / ") }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import TypeLabels from "./TypeLabels.vue";
import versions from "../data/versions.json";
import { humanize, normalize } from "../lib/pokemon";
import { format, locale, t, typeLabel } from "../lib/i18n";

const props = defineProps({ moves: { type: Array, required: true } });
const moveIndex = ref(null);
const error = ref(false);
const search = ref("");
const type = ref("");
const category = ref("");
const groups = computed(() => {
  const available = new Set(props.moves.flatMap(move => move.version_group_details.map(detail => detail.version_group.name)));
  const ordered = Object.keys(versions).filter(name => available.delete(name)).reverse();
  return [...ordered, ...available];
});
const game = ref("");
watch(groups, value => { if (!value.includes(game.value)) game.value = value[0] || ""; }, { immediate: true });
const versionLabel = group => versions[group]?.map(names => names[locale.value] || names.en).filter(Boolean).join(" / ") || humanize(group);
const label = move => move.names?.[locale.value] || move.names?.en || humanize(move.slug);
const gameMoves = computed(() => props.moves.map(move => ({
  ...moveIndex.value?.[move.move.name], slug: move.move.name,
  methods: move.version_group_details.filter(detail => detail.version_group.name === game.value),
})).filter(move => move.methods.length));
const types = computed(() => [...new Set(gameMoves.value.map(move => move.type).filter(Boolean))]
  .sort((a, b) => typeLabel(a).localeCompare(typeLabel(b), locale.value)));
watch(game, () => { type.value = ""; });
const filtered = computed(() => gameMoves.value.filter(move =>
  (!type.value || move.type === type.value) && (!category.value || move.category === category.value) &&
  (!search.value.trim() || normalize(label(move)).includes(normalize(search.value.trim())))
).sort((a, b) => label(a).localeCompare(label(b), locale.value)));

async function load() {
  error.value = false;
  try { moveIndex.value = (await import("../data/moves.json")).default; }
  catch { error.value = true; }
}
load();
</script>
