<script setup lang="ts">
import { Camera } from 'lucide-vue-next'
import { computed } from 'vue'
import { useEmployeeStore } from '~/stores/employee'

interface User {
    name: string
    role: string
    empId: string
    isActive: boolean
}

const props = defineProps<{
    user: User | null
    profileImage: string
    profileInfo: { label: string; value: string }[]
}>()

const employeeStore = useEmployeeStore()
const toast = useToast()

const name = computed(() => props.user?.name ?? '-')
const role = computed(() => props.user?.role ?? '-')
const empId = computed(() => props.user?.empId ?? '-')
const isActive = computed(() => props.user?.isActive ?? false)

const profileImageUploadRef = ref<HTMLInputElement | null>(null)
const profileImagePreviewUrl = ref<string | null>(null)
const isUploading = ref(false)

const triggerPicker = () => {
    profileImageUploadRef.value?.click()
}

const handleFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (file) {
        if (!file.type.startsWith('image/')) return
        
        // Show preview immediately
        if (profileImagePreviewUrl.value) {
            URL.revokeObjectURL(profileImagePreviewUrl.value)
        }
        profileImagePreviewUrl.value = URL.createObjectURL(file)

        // Upload to server
        isUploading.value = true
        try {
            await employeeStore.updateProfilePhoto(file)
            toast.add({ 
                title: 'Success', 
                description: 'Profile photo updated successfully', 
                color: 'success' 
            })
        } catch (err: any) {
            toast.add({ 
                title: 'Error', 
                description: err?.message || 'Failed to update profile photo', 
                color: 'error' 
            })
            // Reset preview on error
            if (profileImagePreviewUrl.value) {
                URL.revokeObjectURL(profileImagePreviewUrl.value)
            }
            profileImagePreviewUrl.value = null
        } finally {
            isUploading.value = false
        }
    }
}
</script>

<template>
    <section
        class="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-2  md:p-4 flex flex-col md:flex-row items-center md:items-start gap-10">
        <div class="relative group shrink-0">
            <div
                class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
                <UAvatar :src="profileImagePreviewUrl || profileImage" :alt="name" size="2xl" class="w-full h-full" :ui="{
                    root: 'w-full h-full',
                    image: 'object-cover'
                }" />
            </div>
            <button type="button" @click="triggerPicker" aria-label="Upload profile picture" :disabled="isUploading"
                class="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-slate-100 text-slate-400 hover:text-primary-600 cursor-pointer transition-colors z-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                <UIcon :name="isUploading ? 'i-heroicons-arrow-path' : Camera" :class="{ 'animate-spin': isUploading }" class="w-5 h-5" />
            </button>
            <input ref="profileImageUploadRef" type="file" accept="image/*" class="hidden" @change="handleFileChange" :disabled="isUploading" />
        </div>

        <div class="flex-1 space-y-4 w-full">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-2">
                <div>
                    <div class="flex items-center gap-3 mb-1">
                        <h2 class="text-3xl font-black text-slate-800 tracking-tight">
                            {{ name }}
                        </h2>

                        <div :class="isActive
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-red-50 text-red-600 border border-red-100'"
                            class="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                            <div v-if="isActive" class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {{ isActive ? 'ACTIVE' : 'INACTIVE' }}
                        </div>
                    </div>

                    <p class="text-lg font-bold text-slate-400">{{ role }}</p>
                    <p class="text-[10px] font-black text-slate-200 uppercase tracking-widest mt-1">
                        Emp ID: {{ empId }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                <div v-for="(info, i) in profileInfo" :key="i" class="flex flex-col gap-0.5">
                    <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        {{ info.label }}
                    </span>
                    <span class="text-sm font-bold text-slate-700">
                        {{ info.value }}
                    </span>
                </div>
            </div>
        </div>
    </section>
</template>
