<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useEmployeeStore } from '../../stores/employee';
import { useInventoryStore } from '../../stores/inventory';
import type { InventoryItem } from '../../types/inventory';

const props = defineProps<{
    modelValue: boolean; // For v-model binding of modal open state
    item: InventoryItem | null;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'success'): void;
}>();

const employeeStore = useEmployeeStore();
const inventoryStore = useInventoryStore();

const assigning = ref(false);
const selectedEmployee = ref<{ id: number; label: string } | null>(null);

// Computes the open state for the UModal
const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

// Fetch employees when modal opens (handled via @open on UModal if supported, or watched props)
// Since UModal doesn't have a simple @open, we can trigger fetch when isOpen becomes true
// or just rely on the parent/button click. 
// A cleaner way in Nuxt UI is to fetch when the component mounts or when `isOpen` becomes true.
watch(isOpen, async (val) => {
    if (val) {
        selectedEmployee.value = null; // Reset selection
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
            // Add status update if your business logic requires it automatically
            // status: 'assigned' 
        });

        const toast = useToast();
        toast.add({
            title: 'Assigned',
            description: `Device assigned to ${selectedEmployee.value.label}`,
            color: 'success'
        });

        // Refresh details in parent
        emit('success');
        isOpen.value = false;
    } catch (error) {
        const toast = useToast();
        toast.add({ title: 'Error', description: `Failed to assign ${props.item?.name} to ${selectedEmployee.value?.label}. Please try again.`, color: 'error' });
    } finally {
        assigning.value = false;
    }
};
</script>

<template>
    <UModal v-model="isOpen">
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-lg font-black text-slate-800">Assign Device</h3>
                    <p class="text-xs text-slate-500 font-medium">
                        Assign <span class="font-bold text-slate-700">{{ item?.name }}</span> to an employee.
                    </p>
                </div>
                <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-mr-2" @click="isOpen = false" />
            </div>

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

            <div class="flex justify-end gap-3 mt-8">
                <UButton label="Cancel" color="gray" variant="ghost" @click="isOpen = false" />
                <UButton label="Confirm Assignment" color="indigo" variant="solid" :loading="assigning"
                    :disabled="!selectedEmployee" @click="handleAssignSubmit" />
            </div>
        </div>
    </UModal>
</template>