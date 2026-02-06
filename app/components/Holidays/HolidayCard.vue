<script setup lang="ts">
import type { Holiday } from '~/stores/holidays'
import { getPublicRestrictedLabel } from '~/utils/holidays'
import ConfirmDialog from '~/components/UI/ConfirmDialog.vue'
import EditHolidayModal from '~/components/Holidays/Modal/EditHolidayModal.vue'

const props = defineProps<{ holiday: Holiday }>()
const holidayStore = useHolidayStore()
const { isSuperUser } = useRoleAccess()
const deleteConfirmOpen = ref(false)
const editModalOpen = ref(false)
const deleting = ref(false)

const handleConfirmDelete = async () => {
    deleting.value = true
    try {
        await holidayStore.deleteHoliday(props.holiday.id)
        deleteConfirmOpen.value = false
    } finally {
        deleting.value = false
    }
}

const actionItems = [
    [
        { label: 'Edit', onSelect: () => { editModalOpen.value = true } },
        { label: 'Delete', onSelect: () => { deleteConfirmOpen.value = true }, color: 'error' as const }
    ]
]
</script>

<template>
    <div class="group relative bg-white border-2 border-slate-200 rounded-2xl p-4 hover:border-indigo-300 hover:shadow-xl transition-all"
        :class="holiday.status === 'Passed' && 'opacity-70 cursor-pointer'">
        <div class="flex items-start justify-between mb-4">
            <div
                :class="['w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center transition-colors', holiday.status === 'Passed' ? 'bg-slate-50' : 'bg-slate-50 group-hover:bg-indigo-50']">
                <UIcon :name="holiday.icon" class="text-indigo-500" />
            </div>
            <div class="flex items-center gap-1.5">
                <UBadge :color="getPublicRestrictedLabel(holiday) === 'Public' ? 'primary' : 'warning'" size="xs" variant="soft"
                    class="font-bold rounded-full px-2.5">
                    {{ getPublicRestrictedLabel(holiday) }}
                </UBadge>
                <UDropdownMenu v-if="isSuperUser" :items="actionItems" >
                    <UButton icon="i-lucide-more-vertical" color="neutral" variant="ghost" size="xs"
                        class="rounded-full shrink-0 cursor-pointer" aria-label="Holiday actions" />
                </UDropdownMenu>
            </div>
        </div>
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-xl border border-indigo-50 flex flex-col items-center justify-center text-indigo-600">
                <span class="text-[8px] font-black uppercase">{{ holiday.date.split(' ')[0] }}</span>
                <span class="text-sm font-black">{{ holiday.date.split(' ')[1] }}</span>
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-600">
                    {{ holiday.name }}
                </h4>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {{ holiday.day }}
                </p>
            </div>
        </div>

        <EditHolidayModal v-model:open="editModalOpen" :holiday="holiday" />
        <ConfirmDialog v-model:open="deleteConfirmOpen" title="Delete Holiday"
            :message="`Are you sure you want to delete ${holiday.name}? This action cannot be undone.`"
            confirm-label="Delete" cancel-label="Cancel" confirm-color="error" :loading="deleting"
            @confirm="handleConfirmDelete" />
    </div>
</template>