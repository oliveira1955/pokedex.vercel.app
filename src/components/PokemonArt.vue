<template>
  <div class="pokemon-art" :class="{ 'pixel-art': retro }">
    <img v-if="source && !failed" :src="source" :alt="name" :loading="eager ? 'eager' : 'lazy'" @error="failed = true">
    <span v-else class="image-missing">{{ t("unavailableImage") }}</span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { artwork } from "../lib/pokemon";
import { t } from "../lib/i18n";

const props = defineProps({
  pokemon: { type: Object, required: true },
  name: { type: String, required: true },
  shiny: Boolean, retro: Boolean, eager: Boolean,
});
const failed = ref(false);
const source = computed(() => artwork(props.pokemon, { shiny: props.shiny, retro: props.retro }));
watch(source, () => { failed.value = false; });
</script>
