<template>
    <UModal v-model:open="modelOpen" :overlay="true"
        :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm', content: 'w-[90vw] sm:w-full sm:max-w-2xl' }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-lg font-semibold text-slate-800">Add New Device</h3>
                <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer" @click="close" />
            </div>
        </template>

        <template #body>
            <UForm ref="formRef" :schema="deviceSchema" :state="state" @submit="onSubmit">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="Device Type" name="device_type" required>
                        <USelect v-model="state.device_type" :items="deviceTypeOptions" placeholder="Select type"
                            class="w-full" />
                    </UFormField>

                    <UFormField label="Brand" name="brand" required>
                        <UInput v-model="state.brand" placeholder="e.g. Lenovo, Dell, HP" class="w-full" />
                    </UFormField>

                    <UFormField label="Model Name" name="model_name" required>
                        <UInput v-model="state.model_name" placeholder="e.g. ProBook X1" class="w-full" />
                    </UFormField>

                    <UFormField label="Serial Number" name="serial_number" required>
                        <UInput v-model="state.serial_number" placeholder="e.g. LPT-EMP7789-474" class="w-full" />
                    </UFormField>

                    <UFormField label="Status" name="status" required>
                        <USelect v-model="state.status" :items="statusOptions" class="w-full" />
                    </UFormField>

                    <UFormField label="Condition" name="condition" required>
                        <USelect v-model="state.condition" :items="conditionOptions" class="w-full" />
                    </UFormField>

                    <UFormField label="Assign to Employee" name="employee">
                        <USelectMenu v-model="state.employee" :items="employeeStore.employeeOptions" searchable
                            placeholder="Select employee (optional)" option-attribute="label" value-attribute="id"
                            :loading="employeeStore.loading" class="w-full" />
                    </UFormField>

                    <UFormField label="Purchase Price" name="purchase_price">
                        <UInput v-model="state.purchase_price" type="number" placeholder="e.g. 50000" class="w-full" />
                    </UFormField>

                    <UFormField label="Purchase Date" name="purchase_date">
                        <UInput v-model="state.purchase_date" type="date" class="w-full" />
                    </UFormField>

                    <UFormField label="Warranty Expiry" name="warranty_expiry">
                        <UInput v-model="state.warranty_expiry" type="date" class="w-full" />
                    </UFormField>

                    <div class="md:col-span-2">
                        <UFormField label="Notes" name="notes">
                            <UTextarea v-model="state.notes" placeholder="Additional notes..." :rows="3"
                                class="w-full" />
                        </UFormField>
                    </div>

                    <div class="md:col-span-2 flex items-center gap-3">
                        <USwitch v-model="state.is_active" />
                        <span class="text-sm font-medium text-slate-700">Active</span>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                    <UButton label="Cancel" color="neutral" variant="ghost" @click="close" />
                    <UButton type="submit" label="Add Device" color="primary" :loading="submitting" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import { useInventoryStore } from '../../stores/inventory';
import { useEmployeeStore } from '../../stores/employee';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits(['update:open', 'close', 'success']);

const inventoryStore = useInventoryStore();
const employeeStore = useEmployeeStore();

const submitting = ref(false);
const formRef = ref();

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
});

watch(() => props.open, async (isOpen) => {
    if (isOpen) {
        Object.assign(state, { ...initialState });
        if (employeeStore.employeesList.length === 0) {
            await employeeStore.fetchEmployees();
        }
    }
});

const close = () => {
    modelOpen.value = false;
    emit('close');
};

const deviceSchema = z.object({
    device_type: z.number().min(1, 'Device type is required'),
    serial_number: z.string().min(1, 'Serial number is required'),
    model_name: z.string().min(1, 'Model name is required'),
    brand: z.string().min(1, 'Brand is required'),
    status: z.string().min(1, 'Status is required'),
    condition: z.string().min(1, 'Condition is required'),
    employee: z.number().nullable().optional(),
    purchase_date: z.string().optional(),
    purchase_price: z.string().optional(),
    warranty_expiry: z.string().optional(),
    notes: z.string().optional(),
    is_active: z.boolean(),
});

type DeviceFormSchema = z.output<typeof deviceSchema>;

const initialState: DeviceFormSchema = {
    device_type: 0,
    serial_number: '',
    model_name: '',
    brand: '',
    status: 'working',
    condition: 'good',
    employee: null,
    purchase_date: '',
    purchase_price: '',
    warranty_expiry: '',
    notes: '',
    is_active: true,
};

const state = reactive<DeviceFormSchema>({ ...initialState });

const statusOptions = [
    { label: 'Working', value: 'working' },
    { label: 'Under Repair', value: 'repair' },
    { label: 'Unassigned', value: 'unassigned' },
    { label: 'Need To Sell', value: 'need_to_sell' },
];

const conditionOptions = [
    { label: 'Excellent', value: 'excellent' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
    { label: 'Poor', value: 'poor' },
];

const deviceTypeOptions = computed(() => {
    return inventoryStore.categories.map(cat => ({
        label: cat.name,
        value: Number(cat.id),
    }));
});

const onSubmit = async (event: FormSubmitEvent<DeviceFormSchema>) => {
    submitting.value = true;
    try {
        await inventoryStore.createDevice(event.data);

        const toast = useToast();
        toast.add({
            title: 'Success',
            description: 'Device added successfully',
            color: 'success'
        });

        emit('success');
        modelOpen.value = false;
    } catch (error: any) {
        const toast = useToast();
        toast.add({
            title: 'Error',
            description: error?.message || 'Failed to add device. Please try again.',
            color: 'error'
        });
    } finally {
        submitting.value = false;
    }
};
</script>
