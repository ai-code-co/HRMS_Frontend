<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { useEmployeeStore } from '~/stores/employee'
import { useRoleAccess } from '~/composables/useRoleAccess'

const bankSchema = z.object({
    bank_name: z.string().min(1, 'Bank name is required'),
    account_number: z.string().min(6, 'Account number must be at least 6 characters'),
    ifsc_code: z.string().length(11, 'IFSC code must be 11 characters'),
    account_holder_name: z.string().min(1, 'Account holder name is required'),
})

type Schema = z.output<typeof bankSchema>

const employeeStore = useEmployeeStore()
const { employee } = storeToRefs(employeeStore)
const { isEmployee } = useRoleAccess()

const isReadOnly = computed(() => isEmployee.value)

const state = reactive({
    bank_name: employee.value?.bank_name ?? '',
    account_number: employee.value?.account_number ?? '',
    ifsc_code: employee.value?.ifsc_code ?? '',
    account_holder_name: employee.value?.account_holder_name ?? '',
})

const loading = ref(false)

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    if (isReadOnly.value) {
        const toast = useToast()
        toast.add({
            title: 'Permission Denied',
            description: 'Only Admin and HR can update bank details',
            color: 'orange'
        })
        return
    }
    loading.value = true
    try {
        const updated = await useApi('/api/employees/update-bank/', {
            method: 'PATCH',
            body: event.data,
        })

        employeeStore.updateEmployee(updated)
        const toast = useToast()
        toast.add({
            title: 'Success',
            description: 'Bank details updated successfully',
            color: 'green'
        })
    } catch (error: any) {
        const toast = useToast()
        toast.add({
            title: 'Error',
            description: error?.data?.error || error?.message || 'Failed to update bank details',
            color: 'red'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UForm :schema="bankSchema" :state="state" class="space-y-6" @submit="onSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField label="Account Holder Name" name="account_holder_name">
                <UInput v-model="state.account_holder_name" :disabled="isReadOnly" placeholder="John Doe" class="w-full" />
            </UFormField>

            <UFormField label="Bank Name" name="bank_name">
                <UInput v-model="state.bank_name" :disabled="isReadOnly" placeholder="International Bank" class="w-full" />
            </UFormField>

            <UFormField label="Account Number" name="account_number">
                <UInput v-model="state.account_number" :disabled="isReadOnly" placeholder="0000000000" class="w-full" />
            </UFormField>

            <UFormField label="IFSC Code" name="ifsc_code">
                <UInput v-model="state.ifsc_code" :disabled="isReadOnly" placeholder="ABCD0123456" class="w-full" />
            </UFormField>
        </div>
        <UButton type="submit" size="lg" :loading="loading" :disabled="isReadOnly" block class="font-bold">
            Save Bank Details
        </UButton>
    </UForm>
</template>