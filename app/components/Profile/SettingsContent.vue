<script setup lang="ts">
import { computed } from 'vue'
import type { TabConfig } from '~/utils/tabConfig'

const props = defineProps<{
    tabs: TabConfig[]
    activeTab: number
}>()

const activeComponent = computed(() => {
    return props.tabs.find(tab => tab.id === props.activeTab)?.component || null
})
</script>

<template>
    <component :is="activeComponent" policy="Password must be 8+ characters" />
</template>
