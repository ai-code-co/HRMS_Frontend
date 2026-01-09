<script setup lang="ts">
import { storeToRefs } from 'pinia'
import HolidayCard from '~/components/Holidays/HolidayCard.vue';
import NextHoliday from '~/components/Holidays/NextHoliday.vue';

const holidayStore = useHolidayStore()
const { holidays, nextHoliday } = storeToRefs(holidayStore)

const { data: holidaysData } = await useAsyncData('holidays', () => {
    return holidayStore.fetchHolidays()
})

if (import.meta.client && holidaysData.value) {
    holidayStore.setHolidays(holidaysData.value)
}

// UI state - managed in component
const filter = ref<'all' | 'public' | 'restricted'>('all')
const searchQuery = ref('')
const filterOptions = ['all', 'public', 'restricted'] as const

// Filtering logic - managed in component
const filteredHolidays = computed(() =>
    holidays.value.filter(h => {
        const matchesFilter = filter.value === 'all' || h.type.toLowerCase() === filter.value
        const matchesSearch = h.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        return matchesFilter && matchesSearch
    })
)
</script>

<template>
    <main class="max-w-7xl mx-auto p-4 md:p-8 space-y-6 pb-24">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <UIcon name="i-lucide-sparkles" class="size-3.5 text-indigo-600" />
                    <p class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Excellence HRMS</p>
                </div>
                <h1 class="text-2xl font-black text-slate-800 tracking-tight">Holiday Calendar 2025</h1>
            </div>

            <!-- <div class="w-full sm:w-64">
                <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Search holiday..." size="md"
                    :ui="{ rounded: 'rounded-xl' }" />
            </div> -->
        </div>
        <NextHoliday v-if="nextHoliday && !searchQuery && filter === 'all'" :holiday="nextHoliday" />
        <div class="flex items-center gap-1.5 bg-slate-100/60 p-1 rounded-xl w-fit border border-slate-200">
            <UButton v-for="f in filterOptions" :key="f" size="xs" variant="ghost" :class="[
                'px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer',
                filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
            ]" @click="filter = f">
                {{ f }}
            </UButton>
        </div>

        <div v-if="filteredHolidays.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            <HolidayCard v-for="h in filteredHolidays" :key="h.name" :holiday="h" />
        </div>

        <div v-else class="py-24 text-center">
            <UIcon name="i-lucide-palmtree" class="size-12 text-slate-200 mb-2" />
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching holidays</p>
        </div>
    </main>
</template>