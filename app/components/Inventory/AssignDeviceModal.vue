<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useEmployeeStore } from '../../stores/employee';
import { useInventoryStore } from '../../stores/inventory';
import type { InventoryItem } from '../../types/inventory';

const props = defineProps<{
    open: boolean;
    item: InventoryItem | null;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'close'): void;
    (e: 'success'): void;
}>();

const employeeStore = useEmployeeStore();
const inventoryStore = useInventoryStore();

const assigning = ref(false);
const selectedEmployee = ref<{ id: number; label: string } | null>(null);

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value),
});

const close = () => {
    modelOpen.value = false;
    emit('close');
};

watch(() => props.open, async (isOpen) => {
    if (isOpen) {
        selectedEmployee.value = null;
        if (employeeStore.employeesList.length === 0) {
            await employeeStore.fetchEmployees();
        }
    }
});

const handleAssignSubmit = async () => {
    if (!props.item?.id || !selectedEmployee.value) return;

    assigning.value = true;
    try {
        await inventoryStore.updateDevice(props.item.id, {
            employee: selectedEmployee.value.id,
        });

        const toast = useToast();
        toast.add({
            title: 'Assigned',
            description: `Device assigned to ${selectedEmployee.value.label}`,
            color: 'success'
        });

        emit('success');
        modelOpen.value = false;
    } catch (error) {
        const toast = useToast();
        toast.add({ title: 'Error', description: `Failed to assign ${props.item?.name} to ${selectedEmployee.value?.label}. Please try again.`, color: 'error' });
    } finally {
        assigning.value = false;
    }
};
</script>

<template>
    <UModal v-model:open="modelOpen" :overlay="true"
        :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm', content: 'w-[90vw] sm:w-full sm:max-w-md' }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div>
                    <h3 class="text-lg font-semibold text-slate-800">Assign Device</h3>
                    <p class="text-xs text-slate-500 font-medium">
                        Assign <span class="font-bold text-slate-700">{{ item?.name }}</span> to an employee.
                    </p>
                </div>
                <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer" @click="close" />
            </div>
        </template>

        <template #body>
            <div class="space-y-4">
                <UFormField label="Select Employee">
                    <USelectMenu v-model="selectedEmployee" :options="employeeStore.employeeOptions" searchable
                        placeholder="Search employee..." option-attribute="label" :loading="employeeStore.loading"
                        class="w-full">
                        <template #option="{ option }">
                            <div class="flex flex-col">
                                <span class="font-medium text-slate-700">{{ option.label }}</span>
                                <span class="text-[10px] text-slate-400">{{ option.designation }}</span>
                            </div>
                        </template>
                    </USelectMenu>
                </UFormField>

                <!-- Current Assignment Warning -->
                <div v-if="item?.assignedTo"
                    class="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 flex items-start gap-2">
                    <div class="mt-0.5 i-lucide-alert-triangle shrink-0" />
                    <div>
                        <span class="font-bold">Warning:</span> Currently assigned to {{ item.assignedTo }}.
                        Re-assigning will override this.
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <UButton label="Cancel" color="neutral" variant="ghost" @click="close" />
                <UButton label="Confirm Assignment" color="primary" :loading="assigning"
                    :disabled="!selectedEmployee" @click="handleAssignSubmit" />
            </div>
        </template>
    </UModal>
</template>