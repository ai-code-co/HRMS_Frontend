<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEmployeeStore } from '~/stores/employee'

const employeeStore = useEmployeeStore()
const { employee } = storeToRefs(employeeStore)

const upload = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('photo', file)

    const updated = await useApi('/api/employees/update-photo/', {
        method: 'PATCH',
        body: formData,
    })

    employeeStore.updateEmployee({ photo_url: updated.photo })
}
</script>

<template>
    <div class="flex flex-col md:flex-row items-center gap-8">
        <div class="w-44 h-44 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
            <img :src="employee?.photo_url || `https://ui-avatars.com/api/?name=${employee?.first_name?.[0]}${employee?.last_name?.[0]}&background=random`"
                class="w-full h-full object-cover" />
        </div>

        <div class="flex flex-col gap-4">
            <label class="bg-indigo-600 text-white px-6 py-3 rounded-xl cursor-pointer text-center">
                Upload New
                <input type="file" class="hidden" @change="upload" />
            </label>

            <button class="bg-slate-50 text-slate-500 px-6 py-3 rounded-xl">
                Remove
            </button>
        </div>
    </div>
</template>
