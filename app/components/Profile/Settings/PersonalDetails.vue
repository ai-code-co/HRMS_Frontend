<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { useEmployeeStore } from '~/stores/employee'
import { useRoleAccess } from '~/composables/useRoleAccess'
import type { SelectMenuItem } from '@nuxt/ui'
const schema = z.object({
    first_name: z.string().min(1, 'First name required'),
    last_name: z.string().min(1, 'Last name required'),
    date_of_birth: z.string().optional(),
    gender: z.string().optional(),
    blood_group: z.string().optional(),
    nationality: z.string().optional(),
    marital_status: z.string().optional(),
    address_line1: z.string().optional(),
    address_line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
    phone: z.string().min(10, 'Invalid phone'),
    alternate_phone: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_relationship: z.string().optional(),
    emergency_phone: z.string().optional(),
})

const marital_statusOptions = ref<SelectMenuItem[]>([
    { label: 'Single', value: 'single' },
    { label: 'Married', value: 'married' },
    { label: 'Divorced', value: 'divorced' }
])

const genderOptions = ref<SelectMenuItem[]>([
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
])

const bloodGroupOptions = ref<SelectMenuItem[]>([
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' }
])

const relationshipOptions = ref<SelectMenuItem[]>([
    { label: 'Spouse', value: 'Spouse' },
    { label: 'Parent', value: 'Parent' },
    { label: 'Sibling', value: 'Sibling' },
    { label: 'Child', value: 'Child' },
    { label: 'Friend', value: 'Friend' },
    { label: 'Other', value: 'Other' }
])

type Schema = z.output<typeof schema>

const employeeStore = useEmployeeStore()
const { employee } = storeToRefs(employeeStore)
const { isSuperUser } = useRoleAccess()
const toast = useToast()

const canEditOfficialInfo = computed(() => isSuperUser.value)
const canEditPersonalInfo = computed(() => true)

// Store original values to track changes
const getInitialState = () => ({
    first_name: employee.value?.first_name ?? '',
    last_name: employee.value?.last_name ?? '',
    date_of_birth: employee.value?.date_of_birth ?? '',
    gender: employee.value?.gender ?? '',
    blood_group: employee.value?.blood_group ?? '',
    nationality: employee.value?.nationality ?? '',
    marital_status: employee.value?.marital_status ?? '',
    address_line1: employee.value?.address_line1 ?? '',
    address_line2: employee.value?.address_line2 ?? '',
    city: employee.value?.city ?? '',
    state: employee.value?.state ?? '',
    country: employee.value?.country ?? '',
    postal_code: employee.value?.postal_code ?? '',
    phone: employee.value?.phone ?? '',
    alternate_phone: employee.value?.alternate_phone ?? '',
    emergency_contact_name: employee.value?.emergency_contacts?.[0]?.name ?? '',
    emergency_contact_relationship: employee.value?.emergency_contacts?.[0]?.relationship ?? '',
    emergency_phone: employee.value?.emergency_contacts?.[0]?.phone ?? '',
})

const originalState = ref(getInitialState())
const state = reactive(getInitialState())

const changedFields = computed(() => {
    const changes: Record<string, any> = {}
    for (const key of Object.keys(state) as (keyof typeof state)[]) {
        if (state[key] !== originalState.value[key]) {
            changes[key] = state[key]
        }
    }
    return changes
})

const hasChanges = computed(() => Object.keys(changedFields.value).length > 0)

const loading = ref(false)
const onSubmit = async (_event: FormSubmitEvent<Schema>) => {
    if (!hasChanges.value) return

    loading.value = true
    try {
        const { data: updated } = await useApi('/api/employees/me/', {
            method: 'PATCH',
            body: changedFields.value,
        })

        employeeStore.updateEmployee(updated)
        originalState.value = { ...state }
        toast.add({
            title: 'Success',
            description: 'Personal details updated successfully',
            color: 'success'
        })
    } catch (err: any) {
        toast.add({
            title: 'Error',
            description: err?.data?.error || err?.message || 'Failed to update personal details',
            color: 'error'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UForm :schema="schema" :state="state" class="space-y-8 w-full max-w-5xl" @submit="onSubmit">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <section class="space-y-3">
                <h4 class="font-bold text-lg">Basic Information</h4>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <UFormField name="first_name" label="First Name">
                        <UInput v-model="state.first_name" :disabled="!canEditOfficialInfo" class="w-full" />
                    </UFormField>

                    <UFormField name="last_name" label="Last Name">
                        <UInput v-model="state.last_name" :disabled="!canEditOfficialInfo" class="w-full" />
                    </UFormField>

                    <UFormField name="date_of_birth" label="Date of Birth">
                        <UInput v-model="state.date_of_birth" type="date" :disabled="!canEditOfficialInfo"
                            class="w-full" />
                    </UFormField>

                    <UFormField name="gender" label="Gender">
                        <USelectMenu v-model="state.gender" :items="genderOptions" :disabled="!canEditOfficialInfo"
                            placeholder="Select gender" class="w-full" arrow value-key="value" />
                    </UFormField>

                    <UFormField name="blood_group" label="Blood Group">
                        <USelectMenu v-model="state.blood_group" :items="bloodGroupOptions"
                            :disabled="!canEditOfficialInfo" placeholder="Select blood group" class="w-full" arrow
                            value-key="value" />
                    </UFormField>

                    <UFormField name="nationality" label="Nationality">
                        <UInput v-model="state.nationality" :disabled="!canEditOfficialInfo" class="w-full"
                            placeholder="e.g. Indian" />
                    </UFormField>

                    <UFormField name="marital_status" label="Marital Status">
                        <USelectMenu v-model="state.marital_status" :items="marital_statusOptions"
                            :disabled="!canEditOfficialInfo" placeholder="Select status" class="w-full" arrow
                            value-key="value" />
                    </UFormField>
                </div>
            </section>

            <section class="space-y-3">
                <h4 class="font-bold text-lg">Contact Information</h4>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <UFormField name="phone" label="Phone">
                        <UInput v-model="state.phone" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="+91 XXXXX XXXXX" />
                    </UFormField>

                    <UFormField name="alternate_phone" label="Alternate Phone">
                        <UInput v-model="state.alternate_phone" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="+91 XXXXX XXXXX" />
                    </UFormField>
                </div>
            </section>

            <section class="space-y-3">
                <h4 class="font-bold text-lg">Address Details</h4>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <UFormField name="address_line1" label="Current Address">
                        <UTextarea v-model="state.address_line1" :disabled="!canEditPersonalInfo" :rows="3"
                            class="w-full" placeholder="Enter current address" />
                    </UFormField>

                    <UFormField name="address_line2" label="Permanent Address">
                        <UTextarea v-model="state.address_line2" :disabled="!canEditPersonalInfo" :rows="3"
                            class="w-full" placeholder="Enter permanent address" />
                    </UFormField>

                    <UFormField name="city" label="City">
                        <UInput v-model="state.city" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="Enter city" />
                    </UFormField>

                    <UFormField name="state" label="State">
                        <UInput v-model="state.state" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="Enter state" />
                    </UFormField>

                    <UFormField name="country" label="Country">
                        <UInput v-model="state.country" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="Enter country" />
                    </UFormField>

                    <UFormField name="postal_code" label="Postal Code">
                        <UInput v-model="state.postal_code" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="Enter postal code" />
                    </UFormField>
                </div>
            </section>

            <section class="space-y-3">
                <h4 class="font-bold text-lg">Emergency Contact</h4>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <UFormField name="emergency_contact_name" label="Contact Name">
                        <UInput v-model="state.emergency_contact_name" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="Emergency contact name" />
                    </UFormField>

                    <UFormField name="emergency_contact_relationship" label="Relationship">
                        <USelectMenu v-model="state.emergency_contact_relationship" :items="relationshipOptions"
                            :disabled="!canEditPersonalInfo" placeholder="Select relationship" class="w-full" arrow
                            value-key="value" />
                    </UFormField>

                    <UFormField name="emergency_phone" label="Emergency Phone">
                        <UInput v-model="state.emergency_phone" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="+91 XXXXX XXXXX" />
                    </UFormField>
                </div>
            </section>
        </div>

        <UButton v-if="canEditOfficialInfo || canEditPersonalInfo" type="submit" size="lg" :loading="loading"
            :disabled="!hasChanges" block class="font-bold max-w-md">
            Save Changes
        </UButton>
    </UForm>
</template>