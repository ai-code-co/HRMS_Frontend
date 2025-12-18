<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { computed } from 'vue'

type Variant = 'primary' | 'outline'

const props = defineProps<{
    variant?: Variant
    loading?: boolean
    class?: string
}>()

const variant = computed(() => props.variant ?? 'primary')

const baseStyles =
    'relative w-full py-3.5 rounded-xl font-medium text-sm tracking-wide transition-all duration-300 transform active:scale-[0.98] overflow-hidden group'

const variantClasses: Record<Variant, string> = {
    primary:
        'bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)]',
    outline:
        'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
}
</script>

<template>
    <UButton :loading="loading" :disabled="loading" :class="[
        baseStyles,
        variantClasses[variant],
        props.class
    ]" color="gray" variant="ghost">
        <div v-if="variant === 'primary'"
            class="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />

        <span class="relative z-20 flex items-center gap-2">
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <slot v-else />
        </span>
    </UButton>
</template>
