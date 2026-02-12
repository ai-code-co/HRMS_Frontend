<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { number, z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { InventoryItem } from '../../types/inventory';
import { useInventoryStore } from '../../stores/inventory';
import { useEmployeeStore } from '../../stores/employee';
import AssignDeviceModal from './AssignDeviceModal.vue';

const props = defineProps<{
  item: InventoryItem | null;
  loading?: boolean;
  documents?: Record<string, { name: string; url: string }>;
}>();

const emit = defineEmits<{
  (e: 'update:documents', docs: Record<string, { name: string; url: string }>): void;
}>();

const store = useInventoryStore();
const employeeStore = useEmployeeStore();

const itemSchema = z.object({
  device_type: z.number().min(1, 'Machine type is required'),
  name: z.string().min(1, 'Machine name is required'),
  purchase_date: z.string().optional(),
  warranty_expiry: z.string().optional(),
  purchase_price: z.string().optional(),
  status: z.enum(['working', 'repair','damaged','need_to_sell','lost','retired','other']),
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

const toast = useToast();

const selectedDocumentType = ref<string | null>(null);
const documentTypeOptions = [
  { label: 'Photo', value: 'photo' },
  { label: 'Warranty', value: 'warranty' },
  { label: 'Invoice', value: 'invoice' },
];

const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFileName = ref<string>('');
const uploadedImageUrl = ref<string>('');

// Track uploaded documents per type
const uploadedDocuments = reactive<Record<string, { name: string; url: string }>>({});

// Sync with props
watch(() => props.documents, (newDocs) => {
  if (newDocs) {
    Object.assign(uploadedDocuments, newDocs);
  }
}, { immediate: true, deep: true });

const openFilePicker = () => {
  if (!selectedDocumentType.value) {
    toast.add({ title: 'Please select a document type first', color: 'warning' });
    return;
  }
  fileInputRef.value?.click();
};

const onDocumentFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !selectedDocumentType.value) return;
  
  const docType = selectedDocumentType.value;
  selectedFileName.value = file.name;
  
  const reader = new FileReader();
  reader.onload = (ev) => {
    const url = ev.target?.result as string;
    uploadedImageUrl.value = url;
    // Store in the documents map by type
    uploadedDocuments[docType] = { name: file.name, url };
    emit('update:documents', { ...uploadedDocuments });
  };
  reader.readAsDataURL(file);
};

const removeFile = () => {
  // Remove from map if a type was selected
  if (selectedDocumentType.value && uploadedDocuments[selectedDocumentType.value]) {
    delete uploadedDocuments[selectedDocumentType.value];
    emit('update:documents', { ...uploadedDocuments });
  }
  selectedFileName.value = '';
  uploadedImageUrl.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
};

// When document type changes, show the existing doc for that type (if any)
watch(selectedDocumentType, (newType) => {
  if (newType && uploadedDocuments[newType]) {
    selectedFileName.value = uploadedDocuments[newType].name;
    uploadedImageUrl.value = uploadedDocuments[newType].url;
  } else {
    selectedFileName.value = '';
    uploadedImageUrl.value = '';
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
});


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

const isDeviceAssigned = computed(() => Boolean(props.item?.assignedTo));

watch(() => props.item?.id, (newId, oldId) => {
  // Update when item ID changes
  if (newId !== oldId && props.item) {
    state.device_type = props.item.type || 0;
    state.name = props.item.name || '';
    state.purchase_date = props.item.purchaseDate || '';
    state.warranty_expiry = props.item.warrantyExpire || '';
    state.purchase_price = props.item.purchase_price || '';
    state.status = props.item.status || 'unassigned';
    state.serial_number = props.item.serialNumber || '';
    state.internalSerial = props.item.internalSerial || '';
    isEditMode.value = false;
  }
}, { immediate: true });

// Also watch the item object for deep changes
watch(() => props.item, (newItem) => {
  if (newItem) {
    state.device_type = newItem.type || 0;
    state.name = newItem.name || '';
    state.purchase_date = newItem.purchaseDate || '';
    state.warranty_expiry = newItem.warrantyExpire || '';
    state.purchase_price = newItem.purchase_price || '';
    state.status = newItem.status || 'unassigned';
    state.serial_number = newItem.serialNumber || '';
    state.purchase_price = newItem.purchase_price || '';
    state.internalSerial = newItem.internalSerial || '';
  }
}, { deep: true });

// --- 4. Options for Select ---
const statusOptions = [
  { label: 'Working', value: 'working' },
  { label: 'Under Repair', value: 'repair' },
  { label: 'Need to Sell', value: 'need_to_sell' },
  { label: 'Damaged', value: 'damaged' },
  { label: 'Lost', value: 'lost' },
  { label: 'Retired', value: 'retired' },
  { label: 'Other', value: 'other' },
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
          <UButton
            :label="isDeviceAssigned ? 'Unassign Device' : 'Assign Device'"
            :icon="isDeviceAssigned ? 'i-lucide-user-minus' : 'i-lucide-user-plus'"
            variant="soft"
            color="primary"
            size="xs"
            class="font-bold px-3 py-2 rounded-lg text-xs uppercase tracking-wider"
            @click="isDeviceAssigned ? handleUnassign() : (isAssignModalOpen = true)"
          />
          <UButton icon="i-lucide-trash-2" color="error" variant="soft" size="xs"
            class="font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider" @click="handleDelete" />
        </div>
      </div>

      <!-- UForm Implementation -->
      <UForm ref="formRef" :schema="itemSchema" :state="state" @submit="onSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <UFormField label="Machine Type" name="type">
            <UInput
              :model-value="props.item?.devicetypeName || ''"
              :disabled="true"
              class="w-full"
              :ui="{ base: 'bg-slate-50' }"
            />
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
            <USelect v-model="state.status" :items="statusOptions" :disabled="!isEditMode" class="w-full"
              :ui="{ base: 'bg-slate-50' }" option-attribute="label" />
          </UFormField>

          <div class="md:col-span-1">
            <UFormField label="Serial Number" name="serial_number">
              <UInput v-model="state.serial_number" :disabled="!isEditMode" class="w-full"
                :ui="{ base: 'bg-slate-50' }" />
            </UFormField>
          </div>

          <div class="md:col-span-1">
            <UFormField label="Internal Serial No." name="internalSerial">
              <UInput v-model="state.internalSerial" :disabled="!isEditMode" class="w-full"
                :ui="{ base: 'bg-slate-50' }" />
            </UFormField>
          </div>
        </div>

        <!-- Document Upload Card -->
        <div class="mt-6 p-1 bg-white rounded-2xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div class="space-y-4">
              <UFormField label="Document Type" name="documentType">
                <USelectMenu
                  v-model="selectedDocumentType"
                  :items="documentTypeOptions"
                  value-key="value"
                  option-attribute="label"
                  placeholder="--Select document--"
                  :disabled="!isEditMode"
                  class="w-full"
                  :ui="{ base: 'bg-slate-50' }"
                />
              </UFormField>
            </div>
            
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Upload Document</label>
              <p class="text-xs text-gray-500 mb-2">{{ selectedFileName ? `Attached: ${selectedFileName}` : 'Select an image to upload' }}</p>
              <div v-if="!uploadedImageUrl || !isEditMode" 
                class="flex items-center gap-3 px-3 py-1.5 border border-gray-300 rounded-md bg-slate-50 transition-colors w-full h-[32px]"
                :class="isEditMode ? 'cursor-pointer' : 'opacity-50 pointer-events-none'"
                @click="isEditMode && openFilePicker()"
              >
                <input 
                  ref="fileInputRef"
                  type="file" 
                  class="hidden" 
                  accept="image/*,.pdf"
                  @change="onDocumentFileChange" 
                />
                <UIcon name="i-lucide-paperclip" class="w-4 h-4 text-slate-400" />
                <span class="text-sm font-medium text-slate-700">Choose File</span>
                <span class="text-xs text-gray-400 ml-1 truncate flex-1">No file chosen</span>
              </div>
              <!-- Image Preview Section -->
              <div v-if="uploadedImageUrl && isEditMode" class="mt-2 space-y-2">
                <p class="text-xs font-semibold uppercase text-slate-500">Preview</p>
                <div class="relative bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <img :src="uploadedImageUrl" alt="Uploaded document" 
                    class="w-full h-48 object-cover rounded-md" />
                  <button v-if="isEditMode" type="button" @click="removeFile"
                    class="absolute top-3 right-3">
                    <UButton icon="i-heroicons-x-mark" color="error" variant="solid" size="xs"
                      class="rounded-full shadow-md cursor-pointer" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end pt-6 gap-2 flex-wrap md:flex-nowrap">
          <UButton v-if="!isEditMode" label="Edit" size="xs" variant="subtle"
            class="font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider w-full md:w-auto"
            @click="isEditMode = true" />

          <UButton v-else type="submit" label="Save" size="xs" variant="subtle" :loading="submitting"
            class="font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider w-full md:w-auto" />

          <UButton v-if="isEditMode" label="Cancel" size="xs" variant="ghost"
            class="font-bold uppercase px-5 py-2.5 w-full md:w-auto" @click="isEditMode = false" />
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
      confirm-color="primary"
      icon="i-lucide-user-minus"
      icon-bg="bg-blue-100"
      icon-color="text-blue-600"
      :loading="unassigning"
      @confirm="confirmUnassign"
    />
  </div>
</template>