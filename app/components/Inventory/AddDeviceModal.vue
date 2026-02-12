<template>
    <UModal v-model:open="modelOpen" :overlay="true"
        :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm', content: 'w-[90vw] sm:w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-[2rem]' }">
        <template #header>
            <div class="flex items-center justify-between w-full px-2">
                <div>
                    <h3 class="text-xl font-bold text-slate-800">Add New Device</h3>
                    <p class="text-xs text-slate-400 font-medium">Register a single asset or perform a bulk import.</p>
                </div>
                <UButton icon="i-heroicons-x-mark" variant="ghost" color="neutral" class="rounded-full cursor-pointer" @click="close" />
            </div>
        </template>

        <template #body>
            <div class="space-y-3 mb-8 shrink-0 px-2">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Entry Method</p>
                <div class="flex gap-4">
                    <label class="flex-1 flex items-center gap-3 cursor-pointer p-4 rounded-2xl border-2 transition-all"
                        :class="uploadMode === 'single' ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-100' : 'border-slate-100 hover:border-slate-200 bg-white'">
                        <input type="radio" v-model="uploadMode" value="single" class="sr-only" />
                        <div :class="['p-2 rounded-lg shadow-sm', uploadMode === 'single' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500']">
                            <UIcon name="i-heroicons-device-phone-mobile" class="w-5 h-5 mt-[5px]" />
                        </div>
                        <span class="text-sm font-bold text-slate-800">Single Asset</span>
                    </label>
                    <label class="flex-1 flex items-center gap-3 cursor-pointer p-4 rounded-2xl border-2 transition-all"
                        :class="uploadMode === 'bulk' ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-100' : 'border-slate-100 hover:border-slate-200 bg-white'">
                        <input type="radio" v-model="uploadMode" value="bulk" class="sr-only" />
                        <div :class="['p-2 rounded-lg shadow-sm', uploadMode === 'bulk' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500']">
                            <UIcon name="i-heroicons-document-arrow-up" class="w-5 h-5 mt-[5px]" />
                        </div>
                        <span class="text-sm font-bold text-slate-800">Bulk Import</span>
                    </label>
                </div>
            </div>

            <div v-if="uploadMode === 'single'" class="overflow-y-auto flex-1 pr-2 custom-scrollbar px-2">
                <UForm ref="formRef" :schema="deviceSchema" :state="state" @submit="onSubmitSingle">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        
                        <UFormField label="Device type" name="device_type" required class="custom-label">
                            <USelectMenu v-model="state.device_type" :items="deviceTypeOptions" value-key="value" option-attribute="label" placeholder="Select type" class="w-full" size="md" :ui="{ rounded: 'rounded-xl' }" />
                        </UFormField>

                        <UFormField label="Serial number" name="serial_number" class="custom-label">
                            <UInput v-model="state.serial_number" placeholder="LPT-EMP..." class="w-full" :ui="{ rounded: 'rounded-xl' }" />
                        </UFormField>

                        <UFormField label="Model name" name="model_name" required class="custom-label">
                            <UInput v-model="state.model_name" placeholder="e.g. MacBook Pro" class="w-full" :ui="{ rounded: 'rounded-xl' }" />
                        </UFormField>

                        <UFormField label="Brand" name="brand" required class="custom-label">
                            <UInput v-model="state.brand" placeholder="e.g. Apple" class="w-full" :ui="{ rounded: 'rounded-xl' }" />
                        </UFormField>

                        <UFormField label="Status" name="status" required class="custom-label">
                            <USelectMenu v-model="state.status" :items="statusOptions" value-key="value" class="w-full" size="md" :ui="{ rounded: 'rounded-xl' }" />
                        </UFormField>

                        <UFormField label="Condition" name="condition" required class="custom-label">
                            <USelectMenu v-model="state.condition" :items="conditionOptions" value-key="value" class="w-full" size="md" :ui="{ rounded: 'rounded-xl' }" />
                        </UFormField>

                        <UFormField label="Assign to Employee (Optional)" name="employee" class="custom-label">
                            <USelectMenu
                                v-model="selectedEmployee"
                                :searchable="searchEmployees"
                                :items="localEmployeeList"
                                placeholder="Search by Name or ID..."
                                option-attribute="name"
                                by="id"
                                :loading="employeesLoading"
                                class="w-full"
                                size="md"
                                :ui="{ rounded: 'rounded-xl' }"
                            >
                                
                            </USelectMenu>
                        </UFormField>

                        <UFormField label="Purchase date" name="purchase_date" class="custom-label">
                            <UInput v-model="state.purchase_date" type="date" class="w-full" :ui="{ rounded: 'rounded-xl' }" />
                        </UFormField>

                        <UFormField label="Purchase price" name="purchase_price" class="custom-label">
                            <UInput v-model="state.purchase_price" placeholder="Amount in ₹" class="w-full" :ui="{ rounded: 'rounded-xl' }" />
                        </UFormField>

                        <UFormField label="Warranty expiry" name="warranty_expiry" class="custom-label">
                            <UInput v-model="state.warranty_expiry" type="date" class="w-full" :ui="{ rounded: 'rounded-xl' }" />
                        </UFormField>

                        <div class="md:col-span-2">
                            <UFormField label="Notes" name="notes" class="custom-label">
                                <UTextarea v-model="state.notes" placeholder="Condition details or specific hardware configs..." :rows="3" :ui="{ rounded: 'rounded-xl' }" />
                            </UFormField>
                        </div>

                        <div class="md:col-span-2 flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <USwitch v-model="state.is_active" color="primary" />
                            <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Mark as Active Asset</span>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 mt-10 pt-6 border-t border-slate-100">
                        <UButton label="Cancel" color="neutral" variant="ghost" @click="close" class="font-bold uppercase text-[11px] tracking-widest" />
                        <UButton type="submit" label="Register Device" color="primary" :loading="submitting" class="font-black px-10 py-3 rounded-xl text-[11px] uppercase tracking-widest shadow-lg shadow-primary-100" />
                    </div>
                </UForm>
            </div>

            <div v-else class="space-y-6 px-2 py-4 h-[400px] flex flex-col items-center justify-center text-center">
                <div class="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                    <UIcon name="i-heroicons-document-magnifying-glass" class="w-10 h-10 text-amber-500" />
                </div>
                <UFormField label="Select CSV File" class="w-full max-w-xs custom-label">
                    <UInput type="file" accept=".csv" @change="handleCsvSelect" class="w-full" :ui="{ rounded: 'rounded-xl' }" />
                </UFormField>
                <div v-if="csvFile" class="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 text-xs font-bold">
                    File Attached: {{ csvFile.name }}
                </div>
                <div class="flex justify-end gap-3 mt-auto w-full pt-6 border-t border-slate-100">
                    <UButton label="Cancel" color="neutral" variant="ghost" @click="close" class="font-bold uppercase text-[11px]" />
                    <UButton 
                        label="Process Bulk Upload" 
                        color="primary" 
                        :disabled="!csvFile" 
                        :loading="submitting"
                        @click="onSubmitBulk" 
                        class="font-bold uppercase text-[11px]" 
                    />
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import { useInventoryStore } from '../../stores/inventory';

// Interfaces for API response
interface Employee {
    id: number;
    employee_id: string;
    full_name: string;
    email: string;
    phone: string;
    department_name: string;
    designation_name: string;
    employment_status: string;
    photo: string | null;
    is_active: boolean;
}

interface EmployeeApiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Employee[];
}

const props = defineProps<{ open: boolean }>();
const emit = defineEmits(['update:open', 'close', 'success']);

const inventoryStore = useInventoryStore();

const uploadMode = ref<'single' | 'bulk'>('single');
const submitting = ref(false);
const formRef = ref();
const csvFile = ref<File | null>(null);

// Local Employee Data State
const rawEmployees = ref<Employee[]>([]);
const employeesLoading = ref(false);
const selectedEmployee = ref<{ id: number; label: string; name?: string; employeeId?: string; designation?: string; avatar?: string } | null>(null);

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
});

const close = () => {
    modelOpen.value = false;
    emit('close');
};

const deviceSchema = z.object({
    device_type: z.number().min(1, 'Device type is required'),
    serial_number: z.string().max(100).optional(),
    model_name: z.string().min(1, 'Model name is required').max(200),
    brand: z.string().min(1, 'Brand is required').max(100),
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

// --- API & State Logic ---

const fetchLocalEmployees = async () => {
    employeesLoading.value = true;
    try {
        const data = await useApi<EmployeeApiResponse>('/api/employees/', {
            credentials: 'include',
        });
        rawEmployees.value = data.results ?? [];
    } catch (error: any) {
        console.error('Failed to fetch employees:', error);
        useToast().add({
            title: 'Error',
            description: error?.data?.message ?? 'Failed to load employees list',
            color: 'error',
        });
    } finally {
        employeesLoading.value = false;
    }
};

const localEmployeeList = computed(() => {
    return rawEmployees.value.map(emp => ({
        id: emp.id,
        label: emp.full_name,
        name: emp.full_name,
        employeeId: emp.employee_id,
        designation: emp.designation_name,
        avatar: emp.photo
    }));
});

const searchEmployees = async (q: string) => {
    if (!q) return localEmployeeList.value;
    const lowerQ = q.toLowerCase();
    return localEmployeeList.value.filter(emp => {
        return (
            (emp.name && emp.name.toLowerCase().includes(lowerQ)) || 
            (emp.employeeId && String(emp.employeeId).toLowerCase().includes(lowerQ))
        );
    });
};

watch(() => props.open, async (isOpen) => {
    if (isOpen) {
        Object.assign(state, { ...initialState });
        selectedEmployee.value = null;
        if (rawEmployees.value.length === 0) {
            await fetchLocalEmployees();
        }
    }
}, { immediate: true });

watch(selectedEmployee, (val) => {
    state.employee = val?.id ?? null;
});

const statusOptions = [
    { label: 'Working', value: 'working' },
    { label: 'Repair', value: 'repair' },
    { label: 'Unassigned', value: 'unassigned' },
    { label: 'Damaged', value: 'damaged' },
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

const handleCsvSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) csvFile.value = target.files[0];
};

const onSubmitSingle = async (event: FormSubmitEvent<DeviceFormSchema>) => {
    submitting.value = true;
    try {
        await inventoryStore.createDevice(event.data);
        const toast = useToast();
        toast.add({ title: 'Success', description: 'Device added successfully', color: 'success' });
        emit('success');
        close();
    } catch (error: any) {
        const toast = useToast();
        toast.add({ title: 'Error', description: error?.message || 'Failed to add device', color: 'error' });
    } finally {
        submitting.value = false;
    }
};

// --- HELPER: Smart Date Parser (Handles DD/MM/YYYY and YYYY-MM-DD) ---
const formatDateForApi = (dateString: string): string | null => {
    if (!dateString) return null;
    
    // 1. If strictly YYYY-MM-DD already, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

    let day, month, year;

    // 2. Try matching DD/MM/YYYY or DD-MM-YYYY (Common Excel export format)
    // Matches 15/01/2024 or 15-01-2024
    const dmyMatch = dateString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    
    if (dmyMatch) {
        day = dmyMatch[1].padStart(2, '0');
        month = dmyMatch[2].padStart(2, '0');
        year = dmyMatch[3];
        return `${year}-${month}-${day}`;
    }

    // 3. Fallback to standard JS Date parsing (for MM/DD/YYYY or other formats)
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        year = date.getFullYear();
        month = String(date.getMonth() + 1).padStart(2, '0');
        day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return null; // Could not parse
}

// --- UPDATED: Robust CSV Parser ---
const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return resolve([]);

            const lines = text.split(/\r\n|\n/).map(l => l.trim()).filter(l => l);
            if (lines.length < 2) return resolve([]); 

            // Clean headers (remove BOM, quotes)
            const headers = lines[0]
                .replace(/^\uFEFF/, '') 
                .split(',')
                .map(h => h.trim().replace(/^"|"$/g, ''));
            
            console.log('Cleaned Headers:', headers);

            const result = lines.slice(1).map(line => {
                // Split by comma, ignoring commas inside quotes
                const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 
                
                const obj: any = {};

                headers.forEach((header, index) => {
                    // Remove quotes if present
                    let value = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
                    
                    if (header === 'device_type' || header === 'employee') {
                        const num = parseInt(value);
                        obj[header] = isNaN(num) ? null : num;
                    } 
                    else if (header === 'is_active') {
                        // Handle 'TRUE', 'True', 'true'
                        obj[header] = value?.toLowerCase() === 'true';
                    } 
                    else if (header === 'purchase_price') {
                        obj[header] = value ? parseFloat(value) : null;
                    } 
                    // --- APPLY SMART DATE PARSER HERE ---
                    else if (header === 'purchase_date' || header === 'warranty_expiry') {
                        obj[header] = formatDateForApi(value);
                    }
                    else {
                        obj[header] = value || ""; 
                    }
                });
                return obj;
            }).filter(obj => {
                // Stricter Empty Row Check:
                // Ensure at least one IMPORTANT field is present (device_type, serial_number, or model_name)
                // This ignores rows that only have `is_active: false` (default)
                return (obj.device_type !== null || obj.serial_number !== "" || obj.model_name !== "");
            });

            resolve(result);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};

const onSubmitBulk = async () => {
    if (!csvFile.value) return;
    submitting.value = true;

    try {
        const jsonArray = await parseCSV(csvFile.value);
        
        console.log('Sending JSON payload:', jsonArray);

        if (jsonArray.length === 0) {
            throw new Error("CSV file is empty or contains no valid rows");
        }

        await useApi('/api/inventory/devices/bulk-add/', {
            method: 'POST',
            credentials: 'include',
            body: jsonArray as any,
        });

        const toast = useToast();
        toast.add({ title: 'Success', description: `Successfully imported ${jsonArray.length} devices`, color: 'success' });
        emit('success');
        close();
    } catch (error: any) {
        console.error('Bulk upload error:', error);
        const toast = useToast();
        let msg = 'Failed to import devices';
        
        // Detailed error extraction
        if (Array.isArray(error.data)) {
             const firstError = error.data[0];
             // Try to find the first validation message from the object
             const key = Object.keys(firstError)[0];
             msg = `${key}: ${firstError[key][0]}`; 
        } else if (error.data?.message) {
             msg = error.data.message;
        }
        
        toast.add({ title: 'Error', description: msg, color: 'error' });
    } finally {
        submitting.value = false;
    }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

:deep(.custom-label label) {
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-size: 10px;
    color: #94a3b8;
    margin-bottom: 6px;
    display: block;
}
</style>