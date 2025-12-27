<template>
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Calendar :size="20" />
            </div>
            <div>
                <h3 class="text-sm font-bold text-slate-800">
                    {{ day?.full_date ? format(parseISO(day.full_date), 'eee, MMM dd, yyyy') : '' }}
                </h3>
                <p class="text-[10px] text-slate-400 font-bold uppercase">
                    Session Overview
                </p>
            </div>
        </div>
        <UButton @click="$emit('close')" icon="i-lucide-x" color="neutral" variant="ghost"
            class="cursor-pointer rounded-full" />
    </div>
</template>

<script setup lang="ts">
import { Calendar } from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'

const props = defineProps<{ day: any }>()
defineEmits(['close'])

const formattedDate = computed(() => {
    if (!props.day?.full_date) return '---'
    return format(parseISO(props.day.full_date), 'eee, MMM dd, yyyy')
})
</script>