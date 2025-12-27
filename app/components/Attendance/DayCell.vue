<script setup lang="ts">
const props = defineProps<{
    day: {
        date: Date
        dateKey: string
        isCurrentMonth: boolean
        isToday: boolean
        record: any
    }
}>()

const styleConfig = computed(() => {
    const type = props.day.record?.day_type
    switch (type) {
        case 'WORKING_DAY': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
        case 'HALF_DAY': return 'bg-amber-50 text-amber-700 border-amber-100'
        case 'WEEKEND_OFF': return 'bg-slate-100 text-slate-400 border-slate-200'
        default: return 'bg-white text-slate-300 border-transparent'
    }
})
</script>

<template>
    <div class="min-h-[130px] p-2 border-b border-r border-slate-200 cursor-pointer hover:bg-slate-50"
        :class="[!day.isCurrentMonth ? 'opacity-40' : '']">

        <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full"
                :class="day.isToday ? 'bg-indigo-600 text-white' : 'text-slate-500'">
                {{ day.date.getDate() }}
            </span>
            <UIcon v-if="day.record?.is_working_from_home" name="i-lucide-home" class="text-indigo-400" size="14" />
        </div>

        <div v-if="day.record" class="space-y-1">
            <div
                :class="['text-[9px] font-bold px-1 py-0.5 rounded border text-center uppercase tracking-tighter', styleConfig]">
                {{ day.record.day_type.replace('_', ' ') }}
            </div>
            <div v-if="day.record.total_time && day.record.total_time !== '0m :0s'"
                class="text-[10px] font-bold text-slate-700 text-center">
                {{ day.record.total_time.split(':')[0] }}{{ day.record.total_time.split(':')[1] }}
            </div>
        </div>
    </div>
</template>