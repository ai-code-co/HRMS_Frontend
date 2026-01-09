<template>
    <div class="space-y-8">
        <div class="flex items-center gap-3">
            <div class="p-2 bg-slate-50 text-slate-400 rounded-lg">
                <UIcon name="i-lucide-history" class="w-6.5 h-6.5" />
            </div>
            <h3 class="text-xl font-black text-slate-800 tracking-tight">Device History</h3>
        </div>

        <div class="relative pl-4 border-l-2 border-slate-100 ml-4 space-y-12">
            <template v-if="history.length > 0">
                <div v-for="(event, idx) in history" :key="idx" class="relative">
                    <div
                        class="absolute -left-7.5 top-0.5 w-6.5 h-6.5 rounded-full bg-white border-4 border-slate-100 group-hover:border-primary-500 transition-colors" />

                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <UAvatar :src="event.photo_url" :alt="event.user" size="sm"
                                class="border-2 border-white shadow-sm" />
                            <div>
                                <p class="text-sm font-black text-slate-800">{{ event.employee_name }}</p>
                                <p class="text-[11px] font-bold text-primary-500 uppercase tracking-widest">{{
                                    event.action }}</p>
                            </div>
                        </div>
                        <span class="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{{ event.formatted_date
                            }}</span>
                    </div>

                    <div class="ml-8 p-2 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <p class="text-sm font-medium text-slate-600 italic leading-relaxed">
                            "{{ event.comment }}"
                        </p>
                    </div>
                </div>
            </template>
            <div v-else class="text-center py-10">
                <p class="text-xs font-bold text-slate-300 uppercase tracking-widest">No recent history logs</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { InventoryItem } from '~/stores/myInventory'
defineProps<{ history: InventoryItem['history'] }>()
</script>