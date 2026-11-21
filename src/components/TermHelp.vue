<template>
  <details class="term-help">
    <summary :aria-label="t('helpAbout') + ' ' + label"><span aria-hidden="true">?</span></summary>
    <p>{{ text }}</p>
  </details>
</template>

<script setup>
import { t } from "../lib/i18n";
defineProps({ label: { type: String, required: true }, text: { type: String, required: true } });
</script>
