<template>
  <div class="type-labels">
    <span v-for="type in types" :key="type" class="type-label" :data-type="type">{{ typeLabel(type) }}</span>
  </div>
</template>

<script setup>
import { typeLabel } from "../lib/i18n";
defineProps({ types: { type: Array, required: true } });
</script>
