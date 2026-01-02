<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { Holiday } from '~/stores/holidays'


const props = defineProps<{ holiday: Holiday }>()
</script>


<template>
    <div class="group relative bg-white border-2 border-slate-200 rounded-2xl p-4 hover:border-indigo-300 hover:shadow-xl transition-all"
        :class="holiday.status === 'Passed' && 'opacity-70 cursor-pointer'">
        <div class="flex items-start justify-between mb-4">
            <div
                :class="['w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center transition-colors', holiday.status === 'Passed' ? 'bg-slate-50' : 'bg-slate-50 group-hover:bg-indigo-50']">
                <UIcon :name="holiday.icon" class="text-indigo-500" />
            </div>
            <UBadge :color="holiday.type === 'Public' ? 'primary' : 'warning'" size="xs" variant="soft"
                class="font-bold rounded-full px-2.5">
                {{ holiday.type }}
            </UBadge>
        </div>
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-xl border border-indigo-50 flex flex-col items-center justify-center text-indigo-600">
                <span class="text-[8px] font-black uppercase">{{ holiday.date.split(' ')[0] }}</span>
                <span class="text-sm font-black">{{ holiday.date.split(' ')[1] }}</span>
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-600">
                    {{ holiday.name }}
                </h4>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {{ holiday.day }}
                </p>
            </div>
        </div>

        <!-- 
        <div class="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
            <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">Details</span>
            <ChevronRight size="14" class="text-slate-300 group-hover:text-indigo-500" />
        </div> -->
    </div>
</template>