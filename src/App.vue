<template>
  <AppShell>
    <RouterView />
  </AppShell>
  <DemoPresenterBar />
</template>

<script setup lang="ts">
import AppShell from '@/components/ui/AppShell.vue'
import DemoPresenterBar from '@/components/screens/demo/DemoPresenterBar.vue'
</script>
