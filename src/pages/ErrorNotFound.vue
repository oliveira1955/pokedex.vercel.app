<template>
  <div class="notice">
    <h1>{{ t("missing") }}</h1>
    <RouterLink :to="{ name: 'catalog' }" class="button">← {{ t("back") }}</RouterLink>
  </div>
</template>

<script setup>
import { t } from "../lib/i18n";
</script>
