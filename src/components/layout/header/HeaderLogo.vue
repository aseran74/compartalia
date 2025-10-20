<template>
  <router-link to="/" class="lg:hidden">
    <img src="/images/logo/Compartalia2.png" alt="Compartalia Logo" class="h-8 w-auto object-contain" />
  </router-link>
  
  <!-- Logo para vista escritorio -->
  <router-link to="/" class="hidden lg:block">
    <img src="/images/logo/Compartalia2.png" alt="Compartalia Logo" class="h-6 w-auto object-contain" />
  </router-link>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
