<script setup lang="ts">
// Dummy Data
const user = ref({
    name: 'John Doe',
    role: 'Jr. Web Developer',
    empId: '834756',
    avatar: 'https://i.pravatar.cc/150?u=shakti',
    email: 'john.doe@example.com',
    phone: '9876543210',
    joinDate: '2025-02-27',
    dob: '2002-10-15',
    gender: 'Male'
})

// Form Data (Reactive)
const form = reactive({
    firstName: 'John',
    lastName: 'Doe',
    maritalStatus: 'Single',
    currentAddress: '',
    permanentAddress: '789, Lokhand wala, Rajajipuram, Dist: Hayat, Dubai - 228932',
    contactNumber: '9876543210',
    emergencyContact: '9876543210',
    personalEmail: 'john.doe@gmail.com',
    bloodGroup: undefined,
    medicalConditions: 'no'
})

// UI State
const activeTab = ref('personal')

const tabs = [
    { id: 'personal', label: 'Personal Details' },
    { id: 'bank', label: 'Bank Details' },
    { id: 'password', label: 'Update Password' },
    { id: 'picture', label: 'Profile Picture' },
]

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const maritalOptions = ['Single', 'Married', 'Divorced', 'Widowed']

// Helper for smooth scrolling or switching logic
const setActive = (id: string) => {
    activeTab.value = id
    // In a real app, you might scroll to section or swap components here
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">

        <!-- 1. Top Banner / Header Info -->
        <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <!-- Info Bar -->
            <div
                class="bg-indigo-50 dark:bg-indigo-950/30 px-6 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                INFO: If you want to Edit contact HR.
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex flex-col md:flex-row gap-6 md:items-start justify-between">

                    <!-- User Identity -->
                    <div class="flex items-center gap-5">
                        <UAvatar :src="user.avatar" alt="Profile" size="3xl"
                            class="ring-4 ring-white dark:ring-gray-800 shadow-lg" />
                        <div>
                            <div class="flex items-center gap-3">
                                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ user.name }}</h1>
                                <span
                                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                    Active
                                </span>
                            </div>
                            <p class="text-base text-gray-500 dark:text-gray-400 font-medium">{{ user.role }}</p>
                            <p class="text-xs text-gray-400 mt-1">Emp ID: <span
                                    class="font-mono text-gray-600 dark:text-gray-300">{{ user.empId }}</span></p>
                        </div>
                    </div>

                    <!-- Meta Details Grid -->
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
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
                            <span class="text-gray-400">Date Of Birth:</span>
                            <span class="font-medium text-gray-900 dark:text-white">{{ user.dob }}</span>
                        </div>
                        <div class="flex justify-between sm:justify-start sm:gap-4 sm:col-span-2">
                            <span class="text-gray-400">Contact:</span>
                            <span class="font-medium text-gray-900 dark:text-white">{{ user.phone }}</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <!-- 2. Main Layout (Sidebar + Content) -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col lg:flex-row gap-8">

                <!-- Left Sidebar Navigation -->
                <aside class="lg:w-64 flex-shrink-0">
                    <nav class="sticky top-24 space-y-1">
                        <!-- Mobile Tabs (Non-scroll, Equal width) -->
                        <div class="lg:hidden">
                            <UTabs v-model="activeTab" :items="tabs.map(t => ({ label: t.label, value: t.id }))"
                                variant="link" :ui="{
                                    list: 'grid grid-cols-4 border-b border-gray-200 dark:border-gray-800',
                                    trigger: 'text-xs py-3',
                                    label: 'whitespace-normal overflow-visible text-clip',
                                    indicator: 'bg-primary-500 h-0.5'
                                }" />
                        </div>

                        <!-- Desktop Sidebar (UNCHANGED) -->
                        <div class="hidden lg:flex lg:flex-col gap-2">
                            <button v-for="tab in tabs" :key="tab.id" @click="setActive(tab.id)"
                                class="whitespace-nowrap px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left border"
                                :class="activeTab === tab.id
                                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'">
                                {{ tab.label }}
                            </button>
                        </div>
                    </nav>
                </aside>

                <!-- Right Content Area -->
                <main class="flex-1">
                    <UCard
                        :ui="{ body: 'p-0 sm:p-0', header: 'px-6 py-4 border-b border-gray-200 dark:border-gray-800' }">
                        <template #header>
                            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                                {{tabs.find(t => t.id === activeTab)?.label}}
                            </h3>
                        </template>

                        <div class="p-6">
                            <!-- Personal Details Form -->
                            <div v-if="activeTab === 'personal'" class="space-y-6">

                                <!-- Row 1: Name -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <UFormField label="First Name" name="firstName">
                                        <UInput v-model="form.firstName" class="w-full" />
                                    </UFormField>
                                    <UFormField label="Last Name" name="lastName">
                                        <UInput v-model="form.lastName" class="w-full" />
                                    </UFormField>
                                </div>

                                <!-- Row 2: Marital Status -->
                                <UFormField label="Marital Status" name="maritalStatus">
                                    <USelect v-model="form.maritalStatus" :items="maritalOptions" class="w-full" />
                                </UFormField>

                                <!-- Row 3: Addresses -->
                                <UFormField label="Current Address" name="currentAddress">
                                    <UTextarea v-model="form.currentAddress" :rows="2" autoresize
                                        placeholder="Enter current address" />
                                </UFormField>

                                <UFormField label="Permanent Address" name="permanentAddress">
                                    <UTextarea v-model="form.permanentAddress" :rows="2" autoresize />
                                </UFormField>

                                <!-- Row 4: Contacts -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <UFormField label="Personal Contact Number" name="contactNumber">
                                        <UInput v-model="form.contactNumber" icon="i-lucide-phone" />
                                    </UFormField>
                                    <UFormField label="Emergency Contact" name="emergencyContact">
                                        <UInput v-model="form.emergencyContact" icon="i-lucide-phone-call" />
                                    </UFormField>
                                </div>

                                <!-- Row 5: Email -->
                                <UFormField label="Personal Email Address" name="personalEmail">
                                    <UInput v-model="form.personalEmail" icon="i-lucide-mail" />
                                </UFormField>

                                <!-- Row 6: Blood Group -->
                                <UFormField label="Blood Group" name="bloodGroup">
                                    <USelect v-model="form.bloodGroup" :items="bloodGroups"
                                        placeholder="--select your blood group--" class="w-full" />
                                </UFormField>

                                <!-- Row 7: Medical -->
                                <UFormField label="Any Medical Conditions" name="medicalConditions">
                                    <UTextarea v-model="form.medicalConditions" :rows="2"
                                        class="bg-gray-50 dark:bg-gray-800" />
                                </UFormField>

                            </div>

                            <div v-else-if="activeTab === 'bank'" class="space-y-6">

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <UFormField label="Account Holder Name">
                                        <UInput placeholder="As per bank records" />
                                    </UFormField>

                                    <UFormField label="Bank Name">
                                        <UInput placeholder="e.g. HDFC Bank" />
                                    </UFormField>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <UFormField label="Account Number">
                                        <UInput placeholder="XXXX XXXX XXXX" />
                                    </UFormField>

                                    <UFormField label="IFSC Code">
                                        <UInput placeholder="HDFC0000123" />
                                    </UFormField>
                                </div>

                                <UFormField label="Branch Address">
                                    <UTextarea :rows="2" placeholder="Bank branch address" />
                                </UFormField>

                                <UAlert icon="i-lucide-shield-check" color="gray" variant="soft"
                                    title="Secure Information">
                                    Bank details are encrypted and visible only to Payroll & HR teams.
                                </UAlert>
                            </div>

                            <div v-else-if="activeTab === 'password'" class="space-y-6 max-w-xl">

                                <UFormField label="Current Password">
                                    <UInput type="password" icon="i-lucide-lock" />
                                </UFormField>

                                <UFormField label="New Password">
                                    <UInput type="password" icon="i-lucide-key" />
                                </UFormField>

                                <UFormField label="Confirm New Password">
                                    <UInput type="password" icon="i-lucide-key-round" />
                                </UFormField>

                                <UAlert icon="i-lucide-info" color="blue" variant="soft" title="Password Policy">
                                    Minimum 8 characters, including uppercase, lowercase, number and symbol.
                                </UAlert>

                                <div class="flex gap-3">
                                    <UButton color="primary" label="Update Password" />
                                    <UButton color="gray" variant="outline" label="Cancel" />
                                </div>
                            </div>

                            <div v-else-if="activeTab === 'picture'" class="space-y-6">

                                <div class="flex flex-col sm:flex-row gap-6 items-center">
                                    <UAvatar :src="user.avatar" size="4xl"
                                        class="ring-4 ring-gray-100 dark:ring-gray-800 shadow-md" />

                                    <div class="space-y-3">
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
                                    Profile picture is visible across HRMS modules like attendance, inventory and
                                    directory.
                                </UAlert>
                            </div>

                            <!-- Placeholders for other tabs -->
                            <div v-else class="py-12 text-center text-gray-500">
                                <UIcon name="i-lucide-hammer" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Content for {{tabs.find(t => t.id === activeTab)?.label}} is under construction.
                                </p>
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
        </div>
    </div>
</template>

<style scoped>
/* Hide scrollbar for the mobile horizontal nav but allow scrolling */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>