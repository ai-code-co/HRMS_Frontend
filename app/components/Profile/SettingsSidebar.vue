<script setup lang="ts">
import type { TabConfig } from './settings/tabConfig'

defineProps<{
    tabs: TabConfig[]
    activeTab: string
}>()

const emit = defineEmits<{
    (e: 'update:activeTab', tab: string): void
}>()

const selectTab = (tab: string) => emit('update:activeTab', tab)
</script>

<template>
    <div class="w-full md:w-72 bg-white border border-slate-100 rounded-2xl p-3 space-y-2 shadow-sm">
        <button v-for="tab in tabs" :key="tab.id" @click="selectTab(tab.id)"
            class="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300"
            :class="{
                'bg-indigo-600 text-white shadow-xl shadow-indigo-100': activeTab === tab.id,
                'text-slate-400 hover:bg-slate-50 hover:text-slate-600': activeTab !== tab.id
            }">
            {{ tab.label }}
        </button>
    </div>
</template>
