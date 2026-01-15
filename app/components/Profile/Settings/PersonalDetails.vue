<script setup lang="ts">
import { reactive, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { useEmployeeStore } from '~/stores/employee'
import { useRoleAccess } from '~/composables/useRoleAccess'
import { useEmployeeContext } from '~/composables/useEmployeeContext'
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
    address_line1_2: z.string().optional(),
    address_line2_2: z.string().optional(),
    city_2: z.string().optional(),
    state_2: z.string().optional(),
    country_2: z.string().optional(),
    postal_code_2: z.string().optional(),
    phone: z.string().min(10, 'Phone must be 10 digits').max(10, 'Phone cannot exceed 10 digits'),
    alternate_phone: z.string().min(10, 'Phone must be 10 digits').max(10, 'Phone cannot exceed 10 digits').optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_relationship: z.string().optional(),
    emergency_phone: z.string().max(10, 'Phone cannot exceed 10 digits').optional(),
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
const { employee, loading } = storeToRefs(employeeStore)
const { isSuperUser } = useRoleAccess()
const { selectedEmployeeId } = useEmployeeContext()

const handleNumericKeyPress = (e: KeyboardEvent) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter']
    const isNumber = /^[0-9]$/.test(e.key)
    if (!isNumber && !allowedKeys.includes(e.key)) {
        e.preventDefault()
    }
}

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
    address_line1_2: employee.value?.address_line1_2 ?? '',
    address_line2_2: employee.value?.address_line2_2 ?? '',
    city_2: employee.value?.city_2 ?? '',
    state_2: employee.value?.state_2 ?? '',
    country_2: employee.value?.country_2 ?? '',
    postal_code_2: employee.value?.postal_code_2 ?? '',
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

const onSubmit = async (_event: FormSubmitEvent<Schema>) => {
    if (!hasChanges.value) return

    try {
        await employeeStore.updatePersonalDetails(changedFields.value, selectedEmployeeId.value)
        originalState.value = { ...state }
    } catch {
        // Error handling is done in the store
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
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-10">
                    <UFormField name="phone" label="Phone">
                        <UInput v-model="state.phone" type="text" inputmode="numeric" pattern="[0-9]+" 
                            maxlength="10"
                            @keypress="handleNumericKeyPress"
                             :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="+91 XXXXX XXXXX" >
                            <template #leading>
                                <span class="text-gray-500 select-none">+91</span>
                            </template>
                        </UInput>
                    </UFormField>

                    <UFormField name="alternate_phone" label="Alternate Phone">
                        <UInput v-model="state.alternate_phone" type="text" inputmode="numeric" pattern="[0-9]+"
                            maxlength="10"
                            @keypress="handleNumericKeyPress"
                            :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="+91 XXXXX XXXXX" 
                            >
                        <template #leading>
                                <span class="text-gray-500 select-none">+91</span>
                            </template></UInput>
                    </UFormField>
                </div>
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
                        <UInput v-model="state.emergency_phone" type="text" inputmode="numeric" pattern="[0-9]+"
                            maxlength="10"
                            @keypress="handleNumericKeyPress"
                            :disabled="!canEditPersonalInfo">
                            <template #leading>
                                <span class="text-gray-500 select-none">+91</span>
                            </template>
                        </UInput>
                    </UFormField>
                </div>
            </section>

            <section class="space-y-3">
                <h4 class="font-bold text-lg">Address Details</h4>
                <div class="font-semibold text-md mb-1">Current Address</div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <UFormField name="address_line1" label="Address Line 1">
                        <UTextarea v-model="state.address_line1" :disabled="!canEditPersonalInfo" :rows="3"
                            class="w-full" placeholder="Enter address line 1" />
                    </UFormField>

                    <UFormField name="address_line2" label="Address Line 2">
                        <UTextarea v-model="state.address_line2" :disabled="!canEditPersonalInfo" :rows="3"
                            class="w-full" placeholder="Enter address line 2" />
                    </UFormField>

                    <UFormField name="city" label="Current City">
                        <UInput v-model="state.city" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="Enter current city" />
                    </UFormField>

                    <UFormField name="state" label="Current State">
                        <UInput v-model="state.state" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="Enter current state" />
                    </UFormField>

                    <UFormField name="country" label="Current Country">
                        <UInput v-model="state.country" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="Enter current country" />
                    </UFormField>

                    <UFormField name="postal_code" label="Current Postal Code">
                        <UInput v-model="state.postal_code" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="Enter current postal code" />
                    </UFormField>
                </div>
            </section>

            <section class="space-y-3">
                <div class="font-semibold text-md mb-1 mt-10">Permanent Address</div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <UFormField name="address_line1_2" label="Address Line 1">
                        <UTextarea v-model="state.address_line1_2" :disabled="!canEditPersonalInfo" :rows="3"
                            class="w-full" placeholder="Enter address line 1" />
                    </UFormField>

                    <UFormField name="address_line2_2" label="Address Line 2">
                        <UTextarea v-model="state.address_line2_2" :disabled="!canEditPersonalInfo" :rows="3"
                            class="w-full" placeholder="Enter address line 2" />
                    </UFormField>

                    <UFormField name="city_2" label="Permanent City">
                        <UInput v-model="state.city_2" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="Enter city" />
                    </UFormField>

                    <UFormField name="state_2" label="Permanent State">
                        <UInput v-model="state.state_2" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="Enter state" />
                    </UFormField>

                    <UFormField name="country_2" label="Permanent Country">
                        <UInput v-model="state.country_2" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="Enter country" />
                    </UFormField>

                    <UFormField name="postal_code_2" label="Permanent Postal Code">
                        <UInput v-model="state.postal_code_2" :disabled="!canEditPersonalInfo" class="w-full"
                            placeholder="Enter postal code" />
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