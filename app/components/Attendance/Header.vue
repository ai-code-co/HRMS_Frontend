<template>
    <header class="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white">
        <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
                <UButton variant="ghost" icon="i-lucide-chevron-left" @click="store.prev" />
                <UButton variant="ghost" icon="i-lucide-chevron-right" @click="store.next" />
            </div>
            <h2 class="text-sm font-bold text-slate-800">{{ store.headerLabel }}</h2>
        </div>
        <div class="flex items-center bg-slate-100 rounded-lg p-1">
            <button v-for="mode in (['week', 'month'] as const)" :key="mode" @click="store.setViewMode(mode)"
                class="px-4 py-1.5 text-xs font-bold rounded-md transition-all capitalize cursor-pointer"
                :class="store.viewMode === mode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'">
                {{ mode }}
            </button>
        </div>
    </header>
</template>

<script setup lang="ts">
const store = useAttendanceStore()
</script>