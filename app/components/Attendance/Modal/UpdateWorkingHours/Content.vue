<template>
    <div class="space-y-4">
        <!-- Employee Info Card -->
        <div v-if="selectedEmployee"
            class="bg-gradient-to-r from-indigo-50 to-slate-50 rounded-2xl border border-indigo-100">
            <div class="flex items-center gap-4">
                <div class="relative p-3">
                    <img v-if="selectedEmployee.photo_url" :src="selectedEmployee.photo_url"
                        :alt="selectedEmployee.full_name"
                        class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div v-else
                        class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm">
                        <User :size="24" class="text-indigo-600" />
                    </div>
                </div>
                <div class="flex-1">
                    <p class="text-base font-bold text-slate-800">
                        {{ selectedEmployee.full_name }}
                    </p>
                    <div class="flex items-center gap-2 mt-0.5">
                        <span v-if="selectedEmployee.designation_name" class="text-xs text-slate-500">
                            {{ selectedEmployee.designation_name }}
                        </span>
                        <span v-if="selectedEmployee.designation_name && selectedEmployee.department_name"
                            class="text-slate-300">•</span>
                        <span v-if="selectedEmployee.department_name" class="text-xs text-slate-500">
                            {{ selectedEmployee.department_name }}
                        </span>
                    </div>
                    <p v-if="selectedEmployee.employee_id" class="text-[10px] text-indigo-500 font-medium mt-1">
                        ID: {{ selectedEmployee.employee_id }}
                    </p>
                </div>
            </div>
        </div>

        <UForm :schema="formSchema" :state="state" @submit="onSubmit" class="space-y-4">
            <!-- Date Range Section -->
            <div class="grid grid-cols-2 gap-4">
                <UFormField label="Start Date" name="startDate">
                    <template #label>
                        <div class="flex items-center gap-2 text-slate-400 mb-1">
                            <Calendar :size="14" />
                            <span class="text-[10px] font-bold uppercase">Start Date</span>
                        </div>
                    </template>
                    <UInput v-model="state.startDate" type="date" class="w-full" size="lg" />
                </UFormField>

                <UFormField label="End Date" name="endDate">
                    <template #label>
                        <div class="flex items-center gap-2 text-slate-400 mb-1">
                            <CalendarCheck :size="14" />
                            <span class="text-[10px] font-bold uppercase">End Date</span>
                        </div>
                    </template>
                    <UInput v-model="state.endDate" type="date" class="w-full" size="lg" />
                </UFormField>
            </div>

            <!-- Working Hours -->
            <UFormField label="Working Hours" name="workingHours">
                <template #label>
                    <div class="flex items-center gap-2 text-slate-400 mb-1">
                        <Clock :size="14" />
                        <span class="text-[10px] font-bold uppercase">Working Hours (per day)</span>
                    </div>
                </template>
                <UInput v-model="state.workingHours" placeholder="e.g. 8" type="number" min="1" max="24" size="lg"
                    class="w-full">
                    <template #trailing>
                        <span class="text-slate-400 text-xs">hrs</span>
                    </template>
                </UInput>
            </UFormField>

            <!-- Reason Section -->
            <UFormField label="Reason" name="reason">
                <template #label>
                    <div class="flex items-center gap-2 text-slate-400 mb-1">
                        <FileText :size="14" />
                        <span class="text-[10px] font-bold uppercase">Reason</span>
                    </div>
                </template>
                <UTextarea v-model="state.reason" placeholder="Enter reason for updating working hours..." :rows="3"
                    class="w-full" />
            </UFormField>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-2">
                <UButton color="neutral" variant="outline" size="lg" block class="cursor-pointer"
                    @click="$emit('close')">
                    Cancel
                </UButton>
                <UButton type="submit" color="primary" size="lg" block class="cursor-pointer" :loading="isSubmitting">
                    {{ isSubmitting ? 'Updating...' : 'Update Hours' }}
                </UButton>
            </div>
        </UForm>
    </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { User, Calendar, CalendarCheck, Clock, FileText } from 'lucide-vue-next'
import type { FormSubmitEvent } from '#ui/types'

const props = defineProps<{
    selectedEmployee?: any | null
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'update-success'): void
}>()

const toast = useToast()
const isSubmitting = ref(false)

const formSchema = z.object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    workingHours: z.coerce.string().min(1, 'Working hours is required'),
    reason: z.string().min(5, 'Reason must be at least 5 characters')
}).refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate)
    }
    return true
}, {
    message: 'End date cannot be before start date',
    path: ['endDate']
})

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0]

const state = ref({
    startDate: today,
    endDate: today,
    workingHours: '',
    reason: ''
})

async function onSubmit(event: FormSubmitEvent<z.output<typeof formSchema>>) {
    isSubmitting.value = true
    try {
        // Convert working hours number to HH:00 format
        const hours = Number(event.data.workingHours)
        const formattedHours = hours.toString().padStart(2, '0') + ':00'

        const payload = {
            employee: props.selectedEmployee?.id,
            start_date: event.data.startDate,
            end_date: event.data.endDate,
            office_working_hours: formattedHours
        }

        await useApi('/api/attendance/bulk-update-working-hours/', {
            method: 'PATCH',
            body: payload
        })

        toast.add({
            title: 'Success',
            description: 'Working hours updated successfully',
            color: 'success'
        })

        emit('update-success')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error?.data?.message || error?.message || 'Failed to update working hours',
            color: 'error'
        })
    } finally {
        isSubmitting.value = false
    }
}
</script>
