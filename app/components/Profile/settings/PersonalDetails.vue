<script setup lang="ts">
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { useEmployeeStore } from '~/stores/employee'
const schema = z.object({
    first_name: z.string().min(1, 'First name required'),
    last_name: z.string().min(1, 'Last name required'),
    marital_status: z.string().optional(),
    address_line1: z.string().optional(),
    address_line2: z.string().optional(),
    phone: z.string().min(10, 'Invalid phone'),
    emergency_phone: z.string().optional(),
})

const marital_statusOptions = [
    { label: 'Single', value: 'single' },
    { label: 'Married', value: 'married' },
    { label: 'Divorced', value: 'divorced' }
]

type Schema = z.output<typeof schema>

const employeeStore = useEmployeeStore()
const { employee } = storeToRefs(employeeStore)

const state = reactive({
    first_name: employee.value?.first_name ?? '',
    last_name: employee.value?.last_name ?? '',
    marital_status: employee.value?.marital_status ?? '',
    address_line1: employee.value?.address_line1 ?? '',
    address_line2: employee.value?.address_line2 ?? '',
    phone: employee.value?.phone ?? '',
    emergency_phone: employee.value?.emergency_contacts?.[0]?.phone ?? '',
})

const loading = ref(false)
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    loading.value = true
    try {
        const updated = await useApi('/api/employees/update-personal/', {
            method: 'PATCH',
            body: event.data,
        })

        employeeStore.updateEmployee(updated)
    } catch (err: any) {
        console.error('Submit error:', err)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UForm :schema="schema" :state="state" class="space-y-10" @submit="onSubmit">
        <section class="space-y-6">
            <h4 class="font-bold text-lg">Basic Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UFormField name="first_name" label="First Name">
                    <UInput v-model="state.first_name" class="w-full" />
                </UFormField>

                <UFormField name="last_name" label="Last Name">
                    <UInput v-model="state.last_name" class="w-full" />
                </UFormField>

                <UFormField name="phone" label="Personal Contact">
                    <UInput v-model="state.phone" class="w-full" />
                </UFormField>

                <UFormField name="emergency_phone" label="Emergency Contact">
                    <UInput v-model="state.emergency_phone" class="w-full" />
                </UFormField>

                <UFormField name="marital_status" label="Marital Status">
                    <USelectMenu v-model="state.marital_status" :options="marital_statusOptions"
                        placeholder="Select status" class="w-full" arrow />

                </UFormField>
            </div>
        </section>
        <section class="space-y-6">
            <h4 class="font-bold text-lg">Address Details</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UFormField name="address_line1" label="Current Address">
                    <UTextarea v-model="state.address_line1" :rows="3" class="w-full" />
                </UFormField>

                <UFormField name="address_line2" label="Permanent Address">
                    <UTextarea v-model="state.address_line2" :rows="3" class="w-full" />
                </UFormField>
            </div>
        </section>

        <UButton type="submit" size="lg" :loading="loading" block class="font-bold">
            Save Changes
        </UButton>
    </UForm>
</template>