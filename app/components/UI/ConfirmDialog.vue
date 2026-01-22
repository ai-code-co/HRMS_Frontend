<script setup lang="ts">
interface Props {
    open: boolean
    title: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    confirmColor?: 'error' | 'primary' | 'warning' | 'success'
    icon?: string
    iconBg?: string
    iconColor?: string
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    confirmColor: 'error',
    icon: 'i-lucide-alert-triangle',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    loading: false
})

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'confirm'): void
    (e: 'cancel'): void
}>()

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
})

const handleCancel = () => {
    emit('cancel')
    modelOpen.value = false
}

const handleConfirm = () => {
    emit('confirm')
}
</script>

<template>
    <UModal v-model:open="modelOpen" :overlay="true" :ui="{
        overlay: 'bg-slate-900/40 backdrop-blur-sm',
        content: 'sm:max-w-md'
    }">
        <template #header>
            <div class="flex items-center gap-3 w-full">
                <div :class="[iconBg, 'p-2 rounded-lg']">
                    <UIcon :name="icon" :class="[iconColor, 'w-5 h-5']" />
                </div>
                <h3 class="text-lg font-bold text-slate-800">{{ title }}</h3>
            </div>
        </template>

        <template #body>
            <p v-if="message || $slots.default" class="text-sm text-slate-600">
                <slot>{{ message }}</slot>
            </p>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3 w-full">
                <UButton :label="cancelLabel" color="neutral" variant="ghost" :disabled="loading"
                    @click="handleCancel" />
                <UButton :label="confirmLabel" :color="confirmColor" variant="solid" :loading="loading"
                    @click="handleConfirm" />
            </div>
        </template>
    </UModal>
</template>
