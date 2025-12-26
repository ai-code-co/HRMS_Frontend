<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch, onMounted } from 'vue'

const employeeStore = useEmployeeStore()
const { employee, loading } = storeToRefs(employeeStore)
onMounted(() => {
    if (!employee.value) employeeStore.fetchEmployee()
})

const user = computed(() => {
    if (!employee.value) return null
    return {
        name: employee.value.full_name,
        role: employee.value.designation_detail?.name ?? '-',
        empId: employee.value.employee_id,
        avatar: employee.value.photo,
        email: employee.value.email,
        phone: employee.value.phone,
        joinDate: employee.value.joining_date,
        dob: employee.value.date_of_birth,
        gender: employee.value.gender,
        isActive: employee.value.is_active,
    }
})

const avatarSrc = computed(() => user.value?.avatar || '')
const avatarFallback = computed(() => {
    if (!user.value?.name) return 'U'
    return user.value.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
})

const form = reactive({
    firstName: '',
    lastName: '',
    maritalStatus: '',
    currentAddress: '',
    permanentAddress: '',
    contactNumber: '',
    emergencyContact: '',
    personalEmail: '',
    bloodGroup: '',
    medicalConditions: '',
})

watch(
    employee,
    (val) => {
        if (!val) return
        form.firstName = val.first_name
        form.lastName = val.last_name
        form.maritalStatus = val.marital_status ?? ''
        form.currentAddress = val.address_line1 ?? ''
        form.permanentAddress = val.address_line2 ?? ''
        form.contactNumber = val.phone
        form.emergencyContact = val.emergency_contacts?.[0]?.phone ?? ''
        form.personalEmail = val.email
        form.bloodGroup = val.blood_group ?? ''
        form.medicalConditions = ''
    },
    { immediate: true }
)

const activeTab = ref('personal')
const tabs = [
    { id: 'personal', label: 'Personal Details' },
    { id: 'bank', label: 'Bank Details' },
    { id: 'password', label: 'Update Password' },
    { id: 'picture', label: 'Profile Picture' },
]
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const maritalOptions = ['single', 'married', 'divorced', 'widowed']
const setActive = (id: string) => (activeTab.value = id)
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">

        <div v-if="loading" class="py-20 text-center text-gray-500">Loading employee profile...</div>

        <template v-else-if="user">
            <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div
                    class="bg-indigo-50 dark:bg-indigo-950/30 px-6 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    INFO: Contact HR for editing sensitive information.
                </div>

                <div class="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between gap-6 items-start">
                    <!-- User Info -->
                    <div class="flex items-center gap-5">
                        <UAvatar :src="avatarSrc" size="3xl" class="ring-4 ring-white dark:ring-gray-800 shadow-lg">
                            <template #fallback>
                                <span class="text-xl font-semibold text-gray-600 dark:text-gray-300">{{ avatarFallback
                                    }}</span>
                            </template>
                        </UAvatar>
                        <div>
                            <div class="flex items-center gap-3">
                                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ user.name }}</h1>
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" :class="user.isActive
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'">
                                    {{ user.isActive ? 'Active' : 'Inactive' }}
                                </span>
                            </div>
                            <p class="text-base text-gray-500 dark:text-gray-400 font-medium">{{ user.role }}</p>
                            <p class="text-xs text-gray-400 mt-1">Emp ID: <span
                                    class="font-mono text-gray-600 dark:text-gray-300">{{ user.empId
                                    }}</span></p>
                        </div>
                    </div>

                    <!-- Meta Grid -->
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div class="flex justify-between sm:justify-start sm:gap-4">
                            <span class="text-gray-400">Joining Date:</span>
                            <span class="font-medium text-gray-900 dark:text-white">{{ user.joinDate }}</span>
                        </div>
                        <div class="flex justify-between sm:justify-start sm:gap-4">
                            <span class="text-gray-400">Work Email:</span>
                            <span class="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{{ user.email
                                }}</span>
                        </div>
                        <div class="flex justify-between sm:justify-start sm:gap-4">
                            <span class="text-gray-400">Gender:</span>
                            <span class="font-medium text-gray-900 dark:text-white">{{ user.gender }}</span>
                        </div>
                        <div class="flex justify-between sm:justify-start sm:gap-4">
                            <span class="text-gray-400">Date of Birth:</span>
                            <span class="font-medium text-gray-900 dark:text-white">{{ user.dob }}</span>
                        </div>
                        <div class="flex justify-between sm:justify-start sm:gap-4 sm:col-span-2">
                            <span class="text-gray-400">Contact:</span>
                            <span class="font-medium text-gray-900 dark:text-white">{{ user.phone }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">

                <aside class="lg:w-64 flex-shrink-0">
                    <nav class="sticky top-24 space-y-2">
                        <button v-for="tab in tabs" :key="tab.id" @click="setActive(tab.id)"
                            class="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border"
                            :class="activeTab === tab.id
                                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'">
                            {{ tab.label }}
                        </button>
                    </nav>
                </aside>

                <main class="flex-1">
                    <UCard
                        :ui="{ body: 'p-0 sm:p-0', header: 'px-6 py-4 border-b border-gray-200 dark:border-gray-800' }">
                        <template #header>
                            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                                {{tabs.find(t => t.id === activeTab)?.label}}
                            </h3>
                        </template>

                        <div class="p-6 space-y-6">

                            <!-- PERSONAL TAB -->
                            <div v-if="activeTab === 'personal'" class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <UFormField label="First Name">
                                        <UInput v-model="form.firstName" />
                                    </UFormField>
                                    <UFormField label="Last Name">
                                        <UInput v-model="form.lastName" />
                                    </UFormField>
                                </div>

                                <UFormField label="Marital Status">
                                    <USelect v-model="form.maritalStatus" :items="maritalOptions" />
                                </UFormField>

                                <UFormField label="Current Address">
                                    <UTextarea v-model="form.currentAddress" rows="2" autoresize />
                                </UFormField>

                                <UFormField label="Permanent Address">
                                    <UTextarea v-model="form.permanentAddress" rows="2" autoresize />
                                </UFormField>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <UFormField label="Contact Number">
                                        <UInput v-model="form.contactNumber" />
                                    </UFormField>
                                    <UFormField label="Emergency Contact">
                                        <UInput v-model="form.emergencyContact" />
                                    </UFormField>
                                </div>

                                <UFormField label="Personal Email">
                                    <UInput v-model="form.personalEmail" />
                                </UFormField>

                                <UFormField label="Blood Group">
                                    <USelect v-model="form.bloodGroup" :items="bloodGroups" />
                                </UFormField>
                            </div>

                            <!-- BANK TAB -->
                            <div v-else-if="activeTab === 'bank'" class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <UFormField label="Account Holder Name">
                                        <UInput :model-value="employee.account_holder_name" disabled />
                                    </UFormField>
                                    <UFormField label="Bank Name">
                                        <UInput :model-value="employee.bank_name" disabled />
                                    </UFormField>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <UFormField label="Account Number">
                                        <UInput :model-value="employee.account_number" disabled />
                                    </UFormField>
                                    <UFormField label="IFSC Code">
                                        <UInput :model-value="employee.ifsc_code" disabled />
                                    </UFormField>
                                </div>
                            </div>

                            <!-- PASSWORD TAB -->
                            <div v-else-if="activeTab === 'password'" class="space-y-6 max-w-xl">
                                <UFormField label="Current Password">
                                    <UInput type="password" />
                                </UFormField>
                                <UFormField label="New Password">
                                    <UInput type="password" />
                                </UFormField>
                                <UFormField label="Confirm New Password">
                                    <UInput type="password" />
                                </UFormField>
                            </div>

                            <!-- PICTURE TAB -->
                            <div v-else-if="activeTab === 'picture'" class="space-y-6">
                                <div class="flex flex-col sm:flex-row gap-6 items-center">
                                    <UAvatar :src="avatarSrc" size="4xl"
                                        class="ring-4 ring-gray-100 dark:ring-gray-800 shadow-md">
                                        <template #fallback>
                                            <span class="text-2xl font-semibold text-gray-600 dark:text-gray-300">{{
                                                avatarFallback }}</span>
                                        </template>
                                    </UAvatar>

                                    <div class="space-y-3 flex-1">
                                        <p class="text-sm text-gray-500 max-w-md">
                                            Upload a professional profile picture. Recommended size is 400×400px.
                                        </p>
                                        <div class="flex gap-3">
                                            <UButton icon="i-lucide-upload" label="Upload New" />
                                            <UButton icon="i-lucide-trash" color="red" variant="outline"
                                                label="Remove" />
                                        </div>
                                    </div>
                                </div>

                                <UAlert icon="i-lucide-camera" color="gray" variant="soft">
                                    Profile picture is visible across HRMS modules like attendance, inventory, and
                                    directory.
                                </UAlert>
                            </div>

                        </div>

                        <template #footer>
                            <div class="flex justify-end px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
                                <UButton label="Update Profile Details" color="primary" size="md" />
                            </div>
                        </template>

                    </UCard>
                </main>
            </div>
        </template>
    </div>
</template>
