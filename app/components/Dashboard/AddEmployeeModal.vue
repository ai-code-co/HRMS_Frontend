<template>
    <UModal v-model:open="modelOpen" :overlay="true"
        :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm', content: 'w-[92vw] sm:w-full sm:max-w-4xl' }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div>
                    <p class="text-[11px] font-black text-indigo-600 uppercase tracking-[0.35em] mb-1">Team</p>
                    <h3 class="text-lg font-semibold text-slate-800">Add New Employee</h3>
                </div>
                <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer" @click="close"
                    :disabled="submitting" />
            </div>
        </template>

        <template #body>
            <!-- Stepper -->
            <div class="mb-8">
                <div class="relative">
                    <!-- Progress Bar Background -->
                    <div class="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 mx-8 sm:mx-12" />
                    <!-- Progress Bar Fill -->
                    <div class="absolute top-5 left-0 h-0.5 bg-linear-to-r from-indigo-500 via-indigo-600 to-indigo-500 mx-8 sm:mx-12 transition-all duration-700 ease-out"
                        :style="{ width: `calc(${(activeStep / (steps.length - 1)) * 100}% - ${activeStep === steps.length - 1 ? '3rem' : '0rem'})` }" />

                    <!-- Steps -->
                    <div class="relative flex justify-between">
                        <button v-for="(step, index) in steps" :key="step.id" type="button"
                            class="flex flex-col items-center group" :class="{ 'pointer-events-none': submitting }"
                            :disabled="submitting" @click="goToStep(index)">
                            <!-- Step Circle -->
                            <div class="relative flex items-center justify-center transition-all duration-500" :class="[
                                index <= activeStep ? 'scale-100' : 'scale-90 group-hover:scale-100'
                            ]">
                                <!-- Pulse Animation for Active Step -->
                                <div v-if="index === activeStep"
                                    class="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20"
                                    style="animation-duration: 2s;" />
                                <!-- Outer Ring -->
                                <div :class="[
                                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 relative z-10',
                                    index === activeStep
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-100'
                                        : index < activeStep
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100'
                                            : 'bg-white text-slate-400 border-2 border-slate-200 group-hover:border-indigo-300 group-hover:text-indigo-500'
                                ]">
                                    <Transition name="step-icon" mode="out-in">
                                        <UIcon v-if="index < activeStep" name="i-heroicons-check" class="w-5 h-5" />
                                        <UIcon v-else :name="step.icon" class="w-5 h-5" />
                                    </Transition>
                                </div>
                            </div>

                            <!-- Step Label -->
                            <div class="mt-3 text-center">
                                <p :class="[
                                    'text-xs font-semibold transition-colors duration-300',
                                    index === activeStep
                                        ? 'text-indigo-600'
                                        : index < activeStep
                                            ? 'text-emerald-600'
                                            : 'text-slate-400 group-hover:text-slate-600'
                                ]">
                                    {{ step.title }}
                                </p>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Step Description -->
                <div class="mt-6 text-center">
                    <Transition name="fade-slide" mode="out-in">
                        <p :key="activeStep" class="text-sm text-slate-500">
                            {{ steps[activeStep]?.description }}
                        </p>
                    </Transition>
                </div>
            </div>

            <UForm ref="formRef" :schema="employeeSchema" :state="employeeForm" class="space-y-4" @submit="onSubmit">
                <div v-if="activeStep === 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="First Name" name="first_name" required>
                        <UInput v-model="employeeForm.first_name" size="xl" color="secondary" variant="outline"
                            placeholder="e.g. Sofia" class="w-full" />
                    </UFormField>
                    <UFormField label="Last Name" name="last_name" required>
                        <UInput v-model="employeeForm.last_name" size="xl" color="secondary" variant="outline"
                            placeholder="e.g. Patel" class="w-full" />
                    </UFormField>
                    <UFormField label="Department" name="department" required>
                        <USelectMenu v-model="employeeForm.department" :items="departmentOptions"
                            placeholder="Select department" class="w-full" value-key="value" size="xl" color="secondary"
                            variant="outline" :loading="departmentStore.loading" />
                    </UFormField>
                    <UFormField label="Designation" name="designation" required>
                        <USelectMenu v-model="employeeForm.designation" :items="designationOptions"
                            :placeholder="employeeForm.department ? 'Select designation' : 'Select department first'"
                            class="w-full" value-key="value" size="xl" color="secondary" variant="outline"
                            :loading="departmentStore.designationLoading" :disabled="!employeeForm.department" />
                    </UFormField>
                    <UFormField label="Date of Birth" name="date_of_birth">
                        <UInput v-model="employeeForm.date_of_birth" type="date" size="xl" color="secondary"
                            variant="outline" class="w-full" />
                    </UFormField>
                    <UFormField label="Gender" name="gender">
                        <USelectMenu v-model="employeeForm.gender" :items="genderOptions" placeholder="Select gender"
                            class="w-full" value-key="value" size="xl" color="secondary" variant="outline" />
                    </UFormField>
                    <UFormField label="Blood Group" name="blood_group">
                        <USelectMenu v-model="employeeForm.blood_group" :items="bloodGroupOptions"
                            placeholder="Select blood group" class="w-full" value-key="value" size="xl"
                            color="secondary" variant="outline" />
                    </UFormField>
                    <UFormField label="Marital Status" name="marital_status">
                        <USelectMenu v-model="employeeForm.marital_status" :items="maritalStatusOptions"
                            placeholder="Select status" class="w-full" value-key="value" size="xl" color="secondary"
                            variant="outline" />
                    </UFormField>
                </div>

                <div v-else-if="activeStep === 1" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="Phone" name="phone" required>
                        <UInput v-model="employeeForm.phone" type="text" inputmode="numeric" pattern="[0-9]+"
                            maxlength="10" @keypress="handleNumericKeyPress" placeholder="+91 XXXXX XXXXX" size="xl"
                            color="secondary" variant="outline" class="w-full">
                            <template #leading>
                                <span class="text-gray-500 select-none">+91</span>
                            </template>
                        </UInput>
                    </UFormField>
                    <UFormField label="Alternate Phone" name="alternate_phone">
                        <UInput v-model="employeeForm.alternate_phone" type="text" inputmode="numeric" pattern="[0-9]+"
                            maxlength="10" @keypress="handleNumericKeyPress" placeholder="+91 XXXXX XXXXX" size="xl"
                            color="secondary" variant="outline" class="w-full">
                            <template #leading>
                                <span class="text-gray-500 select-none">+91</span>
                            </template>
                        </UInput>
                    </UFormField>
                    <UFormField label="Email" name="email" required>
                        <UInput v-model="employeeForm.email" type="email" placeholder="name@example.com" size="xl"
                            color="secondary" variant="outline" class="w-full" />
                    </UFormField>
                </div>

                <div v-else-if="activeStep === 2" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="Address Line 1" name="address_line1">
                        <UTextarea v-model="employeeForm.address_line1" :rows="3" class="w-full"
                            placeholder="Current address line 1" size="xl" color="secondary" variant="outline" />
                    </UFormField>
                    <UFormField label="Address Line 2" name="address_line2">
                        <UTextarea v-model="employeeForm.address_line2" :rows="3" class="w-full"
                            placeholder="Current address line 2" size="xl" color="secondary" variant="outline" />
                    </UFormField>
                    <UFormField label="Current City" name="city">
                        <UInput v-model="employeeForm.city" placeholder="City" size="xl" color="secondary"
                            variant="outline" class="w-full" />
                    </UFormField>
                    <UFormField label="Current State" name="state">
                        <UInput v-model="employeeForm.state" placeholder="State" size="xl" color="secondary"
                            variant="outline" class="w-full" />
                    </UFormField>
                    <UFormField label="Current Country" name="country">
                        <UInput v-model="employeeForm.country" placeholder="Country" size="xl" color="secondary"
                            variant="outline" class="w-full" />
                    </UFormField>
                    <UFormField label="Current Postal Code" name="postal_code">
                        <UInput v-model="employeeForm.postal_code" placeholder="Postal code" size="xl" color="secondary"
                            variant="outline" class="w-full" />
                    </UFormField>
                    <UFormField label="Permanent Address Line 1" name="address_line1_2">
                        <UTextarea v-model="employeeForm.address_line1_2" :rows="3" class="w-full"
                            placeholder="Permanent address line 1" size="xl" color="secondary" variant="outline" />
                    </UFormField>
                    <UFormField label="Permanent Address Line 2" name="address_line2_2">
                        <UTextarea v-model="employeeForm.address_line2_2" :rows="3" class="w-full"
                            placeholder="Permanent address line 2" size="xl" color="secondary" variant="outline" />
                    </UFormField>
                    <UFormField label="Permanent City" name="city_2">
                        <UInput v-model="employeeForm.city_2" placeholder="City" size="xl" color="secondary"
                            variant="outline" class="w-full" />
                    </UFormField>
                    <UFormField label="Permanent State" name="state_2">
                        <UInput v-model="employeeForm.state_2" placeholder="State" size="xl" color="secondary"
                            variant="outline" class="w-full" />
                    </UFormField>
                    <UFormField label="Permanent Country" name="country_2">
                        <UInput v-model="employeeForm.country_2" placeholder="Country" size="xl" color="secondary"
                            variant="outline" class="w-full" />
                    </UFormField>
                    <UFormField label="Permanent Postal Code" name="postal_code_2">
                        <UInput v-model="employeeForm.postal_code_2" placeholder="Postal code" size="xl" maxlength="10"
                            color="secondary" variant="outline" class="w-full" />
                    </UFormField>
                </div>

                <div v-else-if="activeStep === 3" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="Emergency Contact Name" name="emergency_contact_name">
                        <UInput v-model="employeeForm.emergency_contact_name" placeholder="Contact name" size="xl"
                            color="secondary" variant="outline" class="w-full" />
                    </UFormField>
                    <UFormField label="Relationship" name="emergency_contact_relationship">
                        <USelectMenu v-model="employeeForm.emergency_contact_relationship" :items="relationshipOptions"
                            placeholder="Select relationship" class="w-full" value-key="value" size="xl"
                            color="secondary" variant="outline" />
                    </UFormField>
                    <UFormField label="Emergency Phone" name="emergency_phone">
                        <UInput v-model="employeeForm.emergency_phone" type="text" inputmode="numeric" pattern="[0-9]+"
                            maxlength="10" @keypress="handleNumericKeyPress" placeholder="+91 XXXXX XXXXX" size="xl"
                            color="secondary" variant="outline" class="w-full">
                            <template #leading>
                                <span class="text-gray-500 select-none">+91</span>
                            </template>
                        </UInput>
                    </UFormField>
                    <UFormField label="Alternate Phone" name="emergency_alternate_phone">
                        <UInput v-model="employeeForm.emergency_alternate_phone" type="text" inputmode="numeric"
                            pattern="[0-9]+" maxlength="10" @keypress="handleNumericKeyPress"
                            placeholder="+91 XXXXX XXXXX" size="xl" color="secondary" variant="outline" class="w-full">
                            <template #leading>
                                <span class="text-gray-500 select-none">+91</span>
                            </template>
                        </UInput>
                    </UFormField>
                    <UFormField label="Email" name="emergency_email">
                        <UInput v-model="employeeForm.emergency_email" type="email" placeholder="contact@example.com"
                            size="xl" color="secondary" variant="outline" class="w-full" />
                    </UFormField>
                    <UFormField label="Address" name="emergency_address">
                        <UInput v-model="employeeForm.emergency_address" placeholder="Contact address" size="xl"
                            color="secondary" variant="outline" class="w-full" />
                    </UFormField>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="Bank Name" name="bank_name">
                        <UInput v-model="employeeForm.bank_name" placeholder="e.g. HDFC Bank" size="xl"
                            color="secondary" variant="outline" class="w-full" />
                    </UFormField>
                    <UFormField label="Account Holder Name" name="account_holder_name">
                        <UInput v-model="employeeForm.account_holder_name" placeholder="Name as per bank records"
                            size="xl" color="secondary" variant="outline" class="w-full" />
                    </UFormField>
                    <UFormField label="Account Number" name="account_number">
                        <UInput v-model="employeeForm.account_number" type="text" inputmode="numeric"
                            @keypress="handleNumericKeyPress" placeholder="e.g. 50100234567890" size="xl"
                            color="secondary" variant="outline" class="w-full" />
                    </UFormField>
                    <UFormField label="IFSC Code" name="ifsc_code">
                        <UInput v-model="employeeForm.ifsc_code" placeholder="e.g. HDFC0000123" size="xl"
                            color="secondary" variant="outline" class="w-full" maxlength="11"
                            @input="employeeForm.ifsc_code = employeeForm.ifsc_code.toUpperCase()" />
                    </UFormField>
                </div>

                <div class="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
                    <UButton color="neutral" variant="ghost" type="button" size="xl" :disabled="submitting"
                        @click="close">
                        Cancel
                    </UButton>
                    <div class="flex items-center gap-3">
                        <UButton v-if="activeStep > 0" color="neutral" variant="outline" type="button" size="xl"
                            class="cursor-pointer" :disabled="submitting" @click="prevStep">
                            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
                            Back
                        </UButton>
                        <UButton v-if="activeStep < steps.length - 1" color="primary" type="button" size="xl"
                            class="cursor-pointer" :disabled="submitting" @click="nextStep">
                            Next
                            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
                        </UButton>
                        <UButton v-else color="primary" type="submit" size="xl" class="cursor-pointer"
                            :loading="submitting">
                            <UIcon v-if="!submitting" name="i-heroicons-user-plus" class="w-4 h-4" />
                            {{ submitting ? 'Adding...' : 'Add Employee' }}
                        </UButton>
                    </div>
                </div>
            </UForm>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { SelectMenuItem } from '@nuxt/ui'
import type { EmployeeCreateUpdate } from '~/types/employee'
import { useDepartmentStore } from '~/stores/department'
import { useEmployeeStore } from '~/stores/employee'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits(['update:open', 'close', 'success'])

const departmentStore = useDepartmentStore()
const employeeStore = useEmployeeStore()
const submitting = ref(false)

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value),
})

const activeStep = ref(0)
const formRef = ref<any>(null)

const steps = [
    { id: 'basic', title: 'Basic Info', description: 'Enter employee name, department, and personal details', icon: 'i-heroicons-user' },
    { id: 'contact', title: 'Contact', description: 'Add phone numbers and email address', icon: 'i-heroicons-phone' },
    { id: 'address', title: 'Address', description: 'Provide current and permanent address information', icon: 'i-heroicons-map-pin' },
    { id: 'emergency', title: 'Emergency', description: 'Add emergency contact details for safety', icon: 'i-heroicons-heart' },
    { id: 'bank', title: 'Bank', description: 'Add bank account details (optional)', icon: 'i-heroicons-banknotes' },
]


const maritalStatusOptions = ref<SelectMenuItem[]>([
    { label: 'Single', value: 'single' },
    { label: 'Married', value: 'married' },
    { label: 'Divorced', value: 'divorced' },
])

const genderOptions = ref<SelectMenuItem[]>([
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
])

const bloodGroupOptions = ref<SelectMenuItem[]>([
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
])

const relationshipOptions = ref<SelectMenuItem[]>([
    { label: 'Spouse', value: 'Spouse' },
    { label: 'Parent', value: 'Parent' },
    { label: 'Sibling', value: 'Sibling' },
    { label: 'Child', value: 'Child' },
    { label: 'Friend', value: 'Friend' },
    { label: 'Other', value: 'Other' },
])

const employeeSchema = z.object({
    first_name: z.string().min(1, 'First name required'),
    last_name: z.string().min(1, 'Last name required'),
    department: z.number({ required_error: 'Department is required' })
        .min(1, 'Department is required')
        .nullable()
        .refine((val) => val !== null, { message: 'Department is required' }),
    designation: z.number({ required_error: 'Designation is required' })
        .min(1, 'Designation is required')
        .nullable()
        .refine((val) => val !== null, { message: 'Designation is required' }),
    date_of_birth: z.string().optional(),
    gender: z.string().optional(),
    blood_group: z.string().optional(),
    marital_status: z.string().optional(),
    phone: z.string().min(10, 'Phone must be 10 digits').max(10, 'Phone cannot exceed 10 digits'),
    alternate_phone: z.string().max(10, 'Phone cannot exceed 10 digits').optional().or(z.literal('')),
    email: z.string().email('Enter a valid email'),
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
    postal_code_2: z.string().max(10, 'Ensure this field has no more than 10 characters.').optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_relationship: z.string().optional(),
    emergency_phone: z.string().max(10, 'Phone cannot exceed 10 digits').optional().or(z.literal('')),
    emergency_alternate_phone: z.string().max(10, 'Phone cannot exceed 10 digits').optional().or(z.literal('')),
    emergency_email: z.string().email('Enter a valid email').optional().or(z.literal('')),
    emergency_address: z.string().optional(),
    bank_name: z.string().optional(),
    account_number: z.string().optional(),
    ifsc_code: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format').optional().or(z.literal('')),
    account_holder_name: z.string().optional(),
})

type EmployeeFormSchema = z.infer<typeof employeeSchema>

type EmployeeFormState = {
    first_name: string
    last_name: string
    department: number | null
    designation: number | null
    date_of_birth: string
    gender: string
    blood_group: string
    marital_status: string
    phone: string
    alternate_phone: string
    email: string
    address_line1: string
    address_line2: string
    city: string
    state: string
    country: string
    postal_code: string
    address_line1_2: string
    address_line2_2: string
    city_2: string
    state_2: string
    country_2: string
    postal_code_2: string
    emergency_contact_name: string
    emergency_contact_relationship: string
    emergency_phone: string
    emergency_alternate_phone: string
    emergency_email: string
    emergency_address: string
    bank_name: string
    account_number: string
    ifsc_code: string
    account_holder_name: string
}

const initialEmployeeForm: EmployeeFormState = {
    first_name: '',
    last_name: '',
    department: null,
    designation: null,
    date_of_birth: '',
    gender: '',
    blood_group: '',
    marital_status: '',
    phone: '',
    alternate_phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    address_line1_2: '',
    address_line2_2: '',
    city_2: '',
    state_2: '',
    country_2: '',
    postal_code_2: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_phone: '',
    emergency_alternate_phone: '',
    emergency_email: '',
    emergency_address: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
}

const employeeForm = reactive<EmployeeFormState>({ ...initialEmployeeForm })

const departmentOptions = computed<SelectMenuItem[]>(() => departmentStore.departmentOptions)
const designationOptions = computed<SelectMenuItem[]>(() => departmentStore.designationOptions)

const stepFieldMap: Array<(keyof EmployeeFormState)[]> = [
    ['first_name', 'last_name', 'department', 'designation', 'date_of_birth', 'gender', 'blood_group', 'marital_status'],
    ['phone', 'alternate_phone', 'email'],
    [
        'address_line1',
        'address_line2',
        'city',
        'state',
        'country',
        'postal_code',
        'address_line1_2',
        'address_line2_2',
        'city_2',
        'state_2',
        'country_2',
        'postal_code_2',
    ],
    ['emergency_contact_name', 'emergency_contact_relationship', 'emergency_phone', 'emergency_alternate_phone', 'emergency_email', 'emergency_address'],
    ['bank_name', 'account_number', 'ifsc_code', 'account_holder_name'],
]

const handleNumericKeyPress = (e: KeyboardEvent) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter']
    const isNumber = /^[0-9]$/.test(e.key)
    if (!isNumber && !allowedKeys.includes(e.key)) {
        e.preventDefault()
    }
}

const validateStep = async (stepIndex: number) => {
    const fields = stepFieldMap[stepIndex]
    const result = await formRef.value?.validate({ name: fields })
    return result !== false
}

const goToStep = async (stepIndex: number) => {
    if (stepIndex === activeStep.value) return
    if (stepIndex > activeStep.value) {
        const isValid = await validateStep(activeStep.value)
        if (!isValid) return
    }
    activeStep.value = stepIndex
}

const nextStep = async () => {
    const isValid = await validateStep(activeStep.value)
    if (!isValid) return
    activeStep.value = Math.min(activeStep.value + 1, steps.length - 1)
}

const prevStep = () => {
    activeStep.value = Math.max(activeStep.value - 1, 0)
}

const close = () => {
    modelOpen.value = false
    emit('close')
}

const resetForm = () => {
    activeStep.value = 0
    Object.assign(employeeForm, initialEmployeeForm)
    departmentStore.clearDesignations()
    formRef.value?.clear()
}

watch(
    () => props.open,
    async (isOpen) => {
        if (!isOpen) {
            resetForm()
            return
        }

        if (!departmentStore.loading && departmentStore.departments.length === 0) {
            await departmentStore.fetchDepartments()
        }
    }
)

watch(
    () => employeeForm.department,
    async (departmentId) => {
        employeeForm.designation = null
        departmentStore.clearDesignations()
        if (departmentId) {
            await departmentStore.fetchDesignations(departmentId)
        }
    }
)

const selectedDepartmentLabel = computed(() => {
    const item = departmentOptions.value.find(opt => opt.value === employeeForm.department)
    return typeof item === 'object' && item?.label ? item.label : 'department'
})

const onSubmit = async (_event: FormSubmitEvent<EmployeeFormSchema>) => {
    const isValid = await validateStep(activeStep.value)
    if (!isValid) return

    submitting.value = true
    try {
        const payload: EmployeeCreateUpdate = {
            first_name: employeeForm.first_name,
            last_name: employeeForm.last_name,
            department: employeeForm.department ?? 0,
            email: employeeForm.email,
            phone: `+91${employeeForm.phone}`,
            alternate_phone: employeeForm.alternate_phone ? `+91${employeeForm.alternate_phone}` : undefined,
            date_of_birth: employeeForm.date_of_birth || undefined,
            gender: employeeForm.gender || undefined,
            blood_group: employeeForm.blood_group || undefined,
            marital_status: employeeForm.marital_status || undefined,
            address_line1: employeeForm.address_line1 || undefined,
            address_line2: employeeForm.address_line2 || undefined,
            city: employeeForm.city || undefined,
            state: employeeForm.state || undefined,
            country: employeeForm.country || undefined,
            postal_code: employeeForm.postal_code || undefined,
            address_line1_2: employeeForm.address_line1_2 || undefined,
            address_line2_2: employeeForm.address_line2_2 || undefined,
            city_2: employeeForm.city_2 || undefined,
            state_2: employeeForm.state_2 || undefined,
            country_2: employeeForm.country_2 || undefined,
            postal_code_2: employeeForm.postal_code_2 || undefined,
            designation: employeeForm.designation ?? 0,
            bank_name: employeeForm.bank_name || undefined,
            account_number: employeeForm.account_number || undefined,
            ifsc_code: employeeForm.ifsc_code || undefined,
            account_holder_name: employeeForm.account_holder_name || undefined,
            emergency_contacts: employeeForm.emergency_contact_name ? [{
                name: employeeForm.emergency_contact_name,
                relationship: employeeForm.emergency_contact_relationship,
                phone: employeeForm.emergency_phone ? `+91${employeeForm.emergency_phone}` : '',
                alternate_phone: employeeForm.emergency_alternate_phone ? `+91${employeeForm.emergency_alternate_phone}` : undefined,
                email: employeeForm.emergency_email || undefined,
                address: employeeForm.emergency_address || undefined,
                is_primary: true,
            }] : undefined,
        }

        await employeeStore.createEmployee(payload)

        emit('success', { ...employeeForm })
        close()
    } catch (error) {
        // Error toast is handled by the store
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
/* Step icon transition */
.step-icon-enter-active,
.step-icon-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-icon-enter-from {
    opacity: 0;
    transform: scale(0.5) rotate(-180deg);
}

.step-icon-leave-to {
    opacity: 0;
    transform: scale(0.5) rotate(180deg);
}

/* Fade slide transition for description */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
