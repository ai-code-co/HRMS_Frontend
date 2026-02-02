<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { number, z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { InventoryItem } from '../../types/inventory';
import { useInventoryStore } from '../../stores/inventory';
import { useEmployeeStore } from '../../stores/employee';
import AssignDeviceModal from './AssignDeviceModal.vue';

const props = defineProps<{
  item: InventoryItem | null;
  loading?: boolean;
}>();

const store = useInventoryStore();
const employeeStore = useEmployeeStore();

const itemSchema = z.object({
  device_type: z.number().min(1, 'Machine type is required'),
  name: z.string().min(1, 'Machine name is required'),
  purchase_date: z.string().optional(),
  warranty_expiry: z.string().optional(),
  purchase_price: z.string().optional(),
  status: z.enum(['working', 'repair', 'unassigned']),
  serial_number: z.string().min(1, 'Serial number is required'),
  internalSerial: z.string().optional(),
});

type Schema = z.output<typeof itemSchema>;

const isEditMode = ref(false);
const isAssignModalOpen = ref(false);
const submitting = ref(false);
const formRef = ref();
const deleteConfirmOpen = ref(false);
const deleting = ref(false);
const unassignConfirmOpen = ref(false);
const unassigning = ref(false);

const state = reactive<Schema>({
  device_type: 0,
  name: '',
  purchase_date: '',
  warranty_expiry: '',
  purchase_price: '',
  status: 'unassigned',
  serial_number: '',
  internalSerial: '',
});

watch(() => props.item, (newItem) => {
  if (newItem) {
    state.device_type = newItem.type;
    state.name = newItem.name;
    state.purchase_date = newItem.purchaseDate;
    state.warranty_expiry = newItem.warrantyExpire;
    state.purchase_price = newItem.purchase_price;
    state.status = newItem.status;
    state.serial_number = newItem.serialNumber;
    state.internalSerial = newItem.internalSerial;

    // Reset edit mode when item changes
    isEditMode.value = false;
  }
}, { immediate: true });

// --- 4. Options for Select ---
const statusOptions = [
  { label: 'Working', value: 'working' },
  { label: 'Under Repair', value: 'repair' },
  { label: 'Unassigned', value: 'unassigned' }
];

// --- 5. Form Submission ---
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  if (!props.item?.id) return;

  submitting.value = true;
  try {
    await store.updateDevice(props.item.id, event.data);

    const toast = useToast();
    toast.add({ title: 'Success', description: 'Device details updated successfully', color: 'success' });
    isEditMode.value = false;
  } catch (error: any) {
    const toast = useToast();
    toast.add({
      title: 'Error',
      description: `Failed to update ${props.item?.name}. ${error?.message || 'Please try again.'}`,
      color: 'error'
    });
  } finally {
    submitting.value = false;
  }
};


const handleDelete = () => {
  deleteConfirmOpen.value = true;
};

const confirmDelete = async () => {
  if (!props.item?.id) return;

  deleting.value = true;
  try {
    await store.deleteDevice(props.item.id);
    const toast = useToast();
    toast.add({
      title: 'Success',
      description: `${props.item?.name} has been deleted.`,
      color: 'success'
    });
    deleteConfirmOpen.value = false;
  } catch (error: any) {
    const toast = useToast();
    toast.add({
      title: 'Error',
      description: `Failed to delete ${props.item?.name}. ${error?.message || 'Please try again.'}`,
      color: 'error'
    });
  } finally {
    deleting.value = false;
  }
};

const handleAssignmentSuccess = async () => {
  // Refresh the device details to show updated assignment info
  if (props.item?.id) {
    await store.fetchDeviceDetail(props.item.id);
  }
};

const handleUnassign = () => {
  unassignConfirmOpen.value = true;
};

const confirmUnassign = async () => {
  if (!props.item?.id) return;

  unassigning.value = true;
  try {
    const result = await store.unassignDevice(props.item.id);
    if (result) {
      unassignConfirmOpen.value = false;
      await store.fetchDeviceDetail(props.item!.id);
    }
  } finally {
    unassigning.value = false;
  }
};
</script>

<template>
  <div class="flex-1 space-y-6">

    <!-- Loading Skeleton (Preserved) -->
    <div v-if="loading" class="animate-pulse space-y-6">
      <div class="flex justify-between items-center mb-6">
        <div class="h-8 w-48 bg-slate-100 rounded-lg"></div>
        <div class="flex gap-2">
          <div class="h-8 w-20 bg-slate-100 rounded-lg"></div>
          <div class="h-8 w-20 bg-slate-100 rounded-lg"></div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="n in 8" :key="n" class="space-y-2">
          <div class="h-3 w-24 bg-slate-100 rounded"></div>
          <div class="h-10 w-full bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    </div>

    <!-- Empty State (Preserved) -->
    <div v-else-if="!item" class="flex items-center justify-center h-64 text-slate-400 font-medium">
      Select a device to view details
    </div>

    <!-- Actual Content -->
    <div v-else>
      <div class="flex items-center justify-between mb-2">
        <div>
          <h3 class="text-xl font-black text-slate-800 tracking-tight">
            {{ isEditMode ? 'Edit Machine Details' : 'Machine Details' }}
          </h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {{ item.id }}</p>
        </div>
        <div class="flex items-center gap-2">
          <UButton label="Assign Device" icon="i-lucide-user-plus" variant="soft" size="xs"
            class="font-bold px-3 py-2 rounded-lg text-xs uppercase tracking-wider" @click="isAssignModalOpen = true" />
          <UButton icon="i-lucide-trash-2" color="error" variant="soft" size="xs"
            class="font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider" @click="handleDelete" />
        </div>
      </div>

      <!-- UForm Implementation -->
      <UForm ref="formRef" :schema="itemSchema" :state="state" @submit="onSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <UFormField label="Machine Type" name="type">
            <UInput v-model="state.device_type" :disabled="!isEditMode" class="w-full" :ui="{ base: 'bg-slate-50' }" />
          </UFormField>

          <UFormField label="Machine Name" name="name">
            <UInput v-model="state.name" :disabled="!isEditMode" class="w-full" :ui="{ base: 'bg-slate-50' }" />
          </UFormField>

          <UFormField label="Purchase Date" name="purchase_date">
            <UInput type="date" v-model="state.purchase_date" :disabled="!isEditMode" class="w-full"
              :ui="{ base: 'bg-slate-50' }" />
          </UFormField>

          <UFormField label="Warranty Expire" name="warranty_expiry">
            <UInput type="date" v-model="state.warranty_expiry" :disabled="!isEditMode" class="w-full"
              :ui="{ base: 'bg-slate-50' }" />
          </UFormField>

          <UFormField label="Price" name="purchase_price">
            <UInput v-model="state.purchase_price" :disabled="!isEditMode" class="w-full"
              :ui="{ base: 'bg-slate-50' }" />
          </UFormField>

          <UFormField label="Status" name="status">
            <USelect v-model="state.status" :options="statusOptions" :disabled="!isEditMode" class="w-full"
              :ui="{ base: 'bg-slate-50' }" option-attribute="label" />
          </UFormField>

          <div class="md:col-span-2">
            <UFormField label="Serial Number" name="serial_number">
              <UInput v-model="state.serial_number" :disabled="!isEditMode" class="w-full"
                :ui="{ base: 'bg-slate-50' }" />
            </UFormField>
          </div>

          <div class="md:col-span-2">
            <UFormField label="Internal Serial No." name="internalSerial">
              <UInput v-model="state.internalSerial" :disabled="!isEditMode" class="w-full"
                :ui="{ base: 'bg-slate-50' }" />
            </UFormField>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-between pt-6">
          <UButton v-if="item.assignedTo" label="Unassign Device" icon="i-lucide-user-minus" variant="soft" size="xs"
            class="font-bold px-3 py-2 rounded-lg text-xs uppercase tracking-wider" @click="handleUnassign" />
          <div class="flex items-center gap-2">
            <!-- Only show Delete in Edit Mode or if not editing? Usually always visible or in edit mode. -->
            <!-- Toggle between Edit and Save buttons -->
            <UButton v-if="!isEditMode" label="Edit" size="xs" variant="subtle"
              class="font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider" @click="isEditMode = true" />

            <UButton v-else type="submit" label="Save" size="xs" variant="subtle" :loading="submitting"
              class="font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider " />

            <UButton v-if="isEditMode" label="Cancel" size="xs" variant="ghost" class="font-bold uppercase px-5 py-2.5"
              @click="isEditMode = false" />
          </div>
        </div>
      </UForm>
    </div>

    <AssignDeviceModal v-model:open="isAssignModalOpen" :item="item" @success="handleAssignmentSuccess" />

    <UIConfirmDialog
      v-model:open="deleteConfirmOpen"
      title="Delete Device"
      :message="`Are you sure you want to delete ${item?.name}? This action cannot be undone.`"
      confirm-label="Delete"
      cancel-label="Cancel"
      confirm-color="error"
      icon="i-lucide-alert-triangle"
      icon-bg="bg-red-100"
      icon-color="text-red-600"
      :loading="deleting"
      @confirm="confirmDelete"
    />

    <UIConfirmDialog
      v-model:open="unassignConfirmOpen"
      title="Unassign Device"
      :message="`This device is currently assigned to ${item?.assignedTo ?? 'an employee'}. Unassign it?`"
      confirm-label="Unassign"
      cancel-label="Cancel"
      confirm-color="warning"
      icon="i-lucide-user-minus"
      icon-bg="bg-amber-100"
      icon-color="text-amber-600"
      :loading="unassigning"
      @confirm="confirmUnassign"
    />
  </div>
</template>