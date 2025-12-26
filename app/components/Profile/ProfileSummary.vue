<script setup lang="ts">
import { Camera } from 'lucide-vue-next'

const props = defineProps<{
    profileImage: string,
    name: string,
    role: string,
    empId: string,
    isActive: boolean,
    profileInfo: { label: string, value: string }[]
}>()
</script>

<template>
    <section
        class="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-10">
        <div class="relative group shrink-0">
            <div
                class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
                <img :src="props.profileImage" alt="Profile" class="w-full h-full object-cover" />
            </div>
            <div
                class="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-slate-100 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors z-10">
                <Camera size="18" />
            </div>
        </div>
        <div class="flex-1 space-y-8 w-full">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                <div>
                    <div class="flex items-center gap-3 mb-1">
                        <h2 class="text-3xl font-black text-slate-800 tracking-tight">{{ props.name }}</h2>
                        <div :class="props.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'"
                            class="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                            <div v-if="props.isActive" class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {{ props.isActive ? 'ACTIVE' : 'INACTIVE' }}
                        </div>
                    </div>
                    <p class="text-lg font-bold text-slate-400">{{ props.role }}</p>
                    <p class="text-[10px] font-black text-slate-200 uppercase tracking-widest mt-1">Emp ID: {{
                        props.empId }}</p>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                <div v-for="(info, i) in props.profileInfo" :key="i" class="flex flex-col gap-0.5">
                    <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{{ info.label }}</span>
                    <span class="text-sm font-bold text-slate-700">{{ info.value }}</span>
                </div>
            </div>
        </div>
    </section>
</template>
