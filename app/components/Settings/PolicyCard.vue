<script setup lang="ts">
export type PolicyVisibility = 'Policy' | 'Guideline' | 'FAQ' | 'Form' | 'Other'

export interface PolicyItem {
    id: string
    name: string
    link?: string
    docType: string
    visibility: PolicyVisibility
    date: string
    day?: string
    isApplied?: boolean
}

const props = defineProps<{ policy: PolicyItem }>()

const emit = defineEmits<{
    (e: 'view', policy: PolicyItem): void
    (e: 'edit', policy: PolicyItem): void
    (e: 'delete', policy: PolicyItem): void
    (e: 'toggle-apply', policy: PolicyItem): void
}>()

const DOC_TYPE_ICONS: Record<string, string> = {
    policy: 'i-lucide-file-text',
    guideline: 'i-lucide-book-open',
    faq: 'i-lucide-help-circle',
    form: 'i-lucide-clipboard-list',
    other: 'i-lucide-file',
}

const icon = computed(() => DOC_TYPE_ICONS[props.policy.docType] ?? 'i-lucide-file')

const menuItems = computed(() => [[
    { label: 'Edit', onSelect: () => emit('edit', props.policy) },
    { label: 'Delete', onSelect: () => emit('delete', props.policy) },
    { label: props.policy.isApplied ? 'Unapply Policy' : 'Apply Policy', onSelect: () => emit('toggle-apply', props.policy) },
]])

</script>

<template>
    <div
        class="group relative bg-white border-2 border-slate-200 rounded-2xl p-4 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer"
        @click="emit('view', policy)"
    >
        <div class="flex items-start justify-between mb-4">
            <div class="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center transition-colors group-hover:bg-indigo-50">
                <UIcon :name="icon" class="text-indigo-500" />
            </div>
            <div class="flex items-center gap-2">
                <UBadge :color="policy.visibility === 'Policy' ? 'primary' : 'warning'" size="xs" variant="soft" class="font-bold rounded-full px-2.5">
                    {{ policy.visibility }}
                </UBadge>
                <div @click.stop>
                    <UDropdownMenu :key="`menu-${policy.id}`" :items="menuItems" :ui="{ content: 'w-40' }">
                        <UButton icon="i-lucide-more-vertical" variant="ghost" color="primary" size="xs" class="rounded-full cursor-pointer" />
                    </UDropdownMenu>
                </div>
            </div>
        </div>
        <div class="flex items-end justify-between gap-3">
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-600">
                    {{ policy.name }}
                </h4>
                <p v-if="policy.link" class="text-xs text-slate-400 truncate mt-1" :title="policy.link">
                    {{ policy.link }}
                </p>
            </div>
            <span
                class="text-xs font-medium shrink-0"
                :class="policy.isApplied ? 'text-green-600' : 'text-slate-400'"
            >
                {{ policy.isApplied ? 'Applied' : 'Not Applied' }}
            </span>
        </div>
    </div>
</template>
