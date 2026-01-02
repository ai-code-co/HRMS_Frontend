<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch, onMounted } from 'vue'
import ProfileSummary from '~/components/Profile/ProfileSummary.vue'
import SettingsContent from '~/components/Profile/SettingsContent.vue'
import SettingsSidebar from '~/components/Profile/SettingsSidebar.vue'
import { tabs } from '~/utils/tabConfig'

const employeeStore = useEmployeeStore()
const { employee, loading } = storeToRefs(employeeStore)
await useAsyncData('employee', async () => {
    if (!employee.value) {
        await employeeStore.fetchEmployee()
    }
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
const profileInfo = computed(() => {
    if (!user.value) return []

    return [
        { label: 'Email', value: user.value.email ?? '-' },
        { label: 'Phone', value: user.value.phone ?? '-' },
        { label: 'Date of Birth', value: user.value.dob ?? '-' },
        { label: 'Gender', value: user.value.gender ?? '-' },
        { label: 'Join Date', value: user.value.joinDate ?? '-' },
    ]
})

const avatarSrc = computed(() => user.value?.avatar || '')

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

const activeTab = ref<number>(1)
</script>

<template>
    <div class="min-h-screen bg-[#F8FAFC] p-4 md:p-6 flex flex-col gap-8">
        <template v-if="loading">
            <div class="space-y-6">
                <USkeleton class="h-48 w-full" />
                <div class="flex flex-col md:flex-row gap-8">
                    <USkeleton class="h-64 w-1/4" />
                    <USkeleton class="h-64 w-3/4" />
                </div>
            </div>
        </template>
        <template v-else="employee">
            <ProfileSummary :user="user" :profileImage="avatarSrc" :profileInfo="profileInfo" :loading="loading" />

            <div class="flex flex-col md:flex-row gap-8">
                <SettingsSidebar :tabs="tabs" v-model:activeTab="activeTab" />
                <SettingsContent :tabs="tabs" :activeTab="activeTab" />
            </div>
        </template>
    </div>
</template>
