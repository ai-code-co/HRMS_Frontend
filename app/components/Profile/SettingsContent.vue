<script setup lang="ts">
import { computed } from 'vue'
import { tabs } from './settings/tabConfig'
const props = defineProps<{ activeTab: string, profileData: any }>()
// Compute active component dynamically
const activeComponent = computed(() => {
    const tab = tabs.find(t => t.name === props.activeTab)
    return tab?.component || null
})
</script>

<template>
    <component :is="activeComponent" :data="profileData[props.activeTab.toLowerCase().replace(' ', '')]"
        :profileData="profileData" />
</template>
