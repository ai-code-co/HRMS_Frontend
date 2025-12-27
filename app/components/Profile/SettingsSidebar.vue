<script setup lang="ts">
import type { TabConfig } from '~/utils/tabConfig'

const props = defineProps<{
    tabs: TabConfig[]
    activeTab: number
}>()

const emit = defineEmits<{
    (e: 'update:activeTab', tabId: number): void
}>()

const selectTab = (tabId: number) => {
    if (tabId !== props.activeTab) {
        emit('update:activeTab', tabId)
    }
}
</script>
<template>
    <div class="w-full md:w-72 bg-white border border-slate-100 rounded-2xl p-3 space-y-2 shadow-sm">
        <button v-for="tab in tabs" :key="tab.id" @click="selectTab(tab.id)"
            class="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300"
            :class="{
                'bg-indigo-600 text-white shadow-xl shadow-indigo-100': activeTab === tab.id,
                'text-slate-400 hover:bg-slate-50 hover:text-slate-600': activeTab !== tab.id
            }">
            {{ tab.name }}
        </button>
    </div>
</template>
