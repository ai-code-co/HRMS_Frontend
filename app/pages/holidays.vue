<script setup lang="ts">
import { storeToRefs } from 'pinia'
import HolidayCard from '~/components/Holidays/HolidayCard.vue'
import NextHoliday from '~/components/Holidays/NextHoliday.vue'
import AddHolidayModal from '~/components/Holidays/Modal/AddHolidayModal.vue'
const holidayStore = useHolidayStore()
const { isSuperUser } = useRoleAccess()
const addHolidayModalOpen = ref(false)
const { holidays, nextHoliday } = storeToRefs(holidayStore)

const { data: holidaysData } = await useAsyncData('holidays', () => holidayStore.fetchHolidays(), { server: false })

watch(holidaysData, (val) => {
    if (val?.length !== undefined) holidayStore.setHolidays(val)
}, { immediate: true })

type VisibilityFilter = 'all' | 'public' | 'restricted'
const filter = ref<VisibilityFilter>('all')
const filterOptions: VisibilityFilter[] = ['all', 'public', 'restricted']

const filteredHolidays = computed(() =>
    holidays.value.filter(h =>
        filter.value === 'all' ||
        (filter.value === 'public' && !h.is_restricted) ||
        (filter.value === 'restricted' && h.is_restricted)
    )
)
</script>

<template>
    <main class="max-w-7xl mx-auto p-4 md:p-8 space-y-6 pb-24">
        <div class="flex md:flex-row md:items-end justify-between gap-4">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <p class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Excellence HRMS</p>
                </div>
                <h1 class="hidden md:block text-2xl font-black text-slate-800 tracking-tight">Holiday Calendar 2026</h1>
            </div>

            <UButton v-if="isSuperUser" icon="i-lucide-plus" color="primary" size="md" class="cursor-pointer"
                @click="addHolidayModalOpen = true">
            </UButton>
        </div>

        <AddHolidayModal v-if="isSuperUser" v-model:open="addHolidayModalOpen" />
        <NextHoliday v-if="nextHoliday" :holiday="nextHoliday" />
        <div class="flex items-center gap-1.5 bg-slate-100/60 p-1 rounded-xl w-fit border border-slate-200">
            <UButton v-for="f in filterOptions" :key="f" size="xs" variant="ghost" :class="[
                'px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer',
                filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
            ]" @click="filter = f">
                {{ f === 'all' ? 'All' : f === 'public' ? 'Public' : 'Restricted' }}
            </UButton>
        </div>

        <div v-if="filteredHolidays.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            <HolidayCard v-for="h in filteredHolidays" :key="h.id" :holiday="h" />
        </div>

        <div v-else class="py-24 text-center">
            <UIcon name="i-lucide-palmtree" class="size-12 text-slate-200 mb-2" />
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching holidays</p>
        </div>
    </main>
</template>