<template>
    <UModal v-model:open="modelOpen" :overlay="true"
        :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm', content: 'w-[90vw] sm:w-full sm:max-w-2xl' }" size="2xl">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-lg font-semibold text-slate-800">Add Custom Holiday</h3>
                <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer" @click="close" />
            </div>
        </template>

        <template #body>
            <UForm @submit.prevent="onSubmit" class="w-full">
                <div class="space-y-4">
                    <template v-if="!csvFile">
                        <UFormField label="Holiday Name" name="name">
                            <UInput v-model="state.name" size="xl" placeholder="e.g. Diwali, Christmas"
                                color="secondary" variant="outline" class="w-full" />
                        </UFormField>

                        <UFormField label="Date" name="date">
                            <UPopover class="w-full">
                                <UButton color="secondary" variant="outline" icon="i-lucide-calendar" block size="xl"
                                    class="w-full justify-start">
                                    {{ state.date ? df.format(state.date.toDate(getLocalTimeZone())) : 'Select date' }}
                                </UButton>
                                <template #content>
                                    <UCalendar v-model="state.date" class="p-2" />
                                </template>
                            </UPopover>
                        </UFormField>

                        <UFormField label="Type" name="holiday_type">
                            <USelectMenu v-model="state.holiday_type" :items="typeOptions" size="xl"
                                value-key="value" placeholder="Select type" color="secondary" variant="outline" class="w-full" />
                        </UFormField>

                        <div class="flex items-center my-4">
                            <div class="flex-grow border-t border-slate-200"></div>
                            <span class="mx-3 text-sm text-slate-500">OR</span>
                            <div class="flex-grow border-t border-slate-200"></div>
                        </div>

                    </template>

                    <!-- CSV Upload Section -->
                    <div>
                        <UFormField label="Upload (.csv file to add multiple holiday)" name="csvFile">
                            <div v-if="!csvFile" class="relative">
                                <UInput type="file" icon="i-heroicons-paper-clip" accept=".csv" @change="handleCsvUpload"
                                    size="xl" color="secondary" variant="outline" class="cursor-pointer w-full" />
                            </div>
                            <div v-else class="space-y-2">
                                <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div class="flex items-center gap-2">
                                        <UIcon name="i-lucide-file-text" class="text-slate-400" />
                                        <span class="text-sm font-medium text-slate-700">{{ csvFileName }}</span>
                                    </div>
                                    <UButton icon="i-heroicons-x-mark" color="error" variant="ghost" size="xs"
                                        @click="removeCsvFile" class="cursor-pointer" />
                                </div>
                            </div>
                        </UFormField>

                        <!-- CSV Holidays List (Table) -->
                        <div v-if="csvHolidays.length > 0" class="mt-4 space-y-2">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-medium text-slate-700">
                                    Holidays from CSV ({{ selectedCsvHolidays.length }} selected)
                                </p>
                                <div class="flex gap-2">
                                    <UButton size="xs" variant="ghost" @click="selectAllCsvHolidays"
                                        class="cursor-pointer text-xs">
                                        Select All
                                    </UButton>
                                    <UButton size="xs" variant="ghost" @click="deselectAllCsvHolidays"
                                        class="cursor-pointer text-xs">
                                        Deselect All
                                    </UButton>
                                </div>
                            </div>
                            <div class="max-h-48 overflow-y-auto border border-slate-200 rounded-lg overflow-hidden">
                                <table class="w-full text-sm text-left">
                                    <thead class="text-xs font-semibold text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th class="w-10 py-3 px-3">
                                                <span class="sr-only">Select</span>
                                            </th>
                                            <th class="py-3 px-3">Name</th>
                                            <th class="py-3 px-3">Date</th>
                                            <th class="py-3 px-3">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(row, index) in csvHolidays" :key="index"
                                            class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td class="py-2.5 px-3">
                                                <input type="checkbox" :id="`csv-holiday-${index}`" v-model="selectedCsvHolidays"
                                                    :value="row"
                                                    class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer" />
                                            </td>
                                            <td class="py-2.5 px-3 font-medium text-slate-700">
                                                <label :for="`csv-holiday-${index}`" class="cursor-pointer">{{ row.name }}</label>
                                            </td>
                                            <td class="py-2.5 px-3 text-slate-600">{{ row.date }}</td>
                                            <td class="py-2.5 px-3 text-slate-600 capitalize">{{ row.holiday_type }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <UButton type="submit" block size="xl" :loading="holidayStore.isLoading" :disabled="totalHolidaysToAdd === 0"
                    class="mt-6">
                    Add Holiday{{ totalHolidaysToAdd !== 1 ? 's' : '' }} ({{ totalHolidaysToAdd }})
                </UButton>
            </UForm>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { useHolidayStore, HOLIDAY_TYPE_OPTIONS_WITH_RESTRICTED, type HolidayType, toApiHolidayType } from '~/stores/holidays'

const TYPE_OPTIONS_VALUES = ['national', 'regional', 'religious', 'cultural', 'other', 'restricted'] as const
type CsvHolidayRow = { name: string; date: string; holiday_type: HolidayType }

const props = defineProps<{ open: boolean }>()
const emit = defineEmits(['update:open', 'close'])

const holidayStore = useHolidayStore()
const toast = useToast()
const df = new DateFormatter('en-US', { dateStyle: 'medium' })

const today = () => {
    const d = new Date()
    return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

const state = ref<{
    name: string
    date: CalendarDate
    holiday_type: HolidayType | 'restricted'
}>({
    name: '',
    date: today(),
    holiday_type: 'national'
})

const typeOptions = HOLIDAY_TYPE_OPTIONS_WITH_RESTRICTED

const csvFile = ref<File | null>(null)
const csvFileName = ref('')
const csvHolidays = ref<CsvHolidayRow[]>([])
const selectedCsvHolidays = ref<CsvHolidayRow[]>([])

const hasValidSingle = computed(() => {
    return !!state.value.name?.trim() && state.value.date != null
})

const totalHolidaysToAdd = computed(() => {
    let count = 0
    if (hasValidSingle.value) count += 1
    count += selectedCsvHolidays.value.length
    return count
})

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
})

watch(() => props.open, (isOpen) => {
    if (!isOpen) {
        state.value = { name: '', date: today(), holiday_type: 'national' }
        csvFile.value = null
        csvFileName.value = ''
        csvHolidays.value = []
        selectedCsvHolidays.value = []
    }
})

const close = () => {
    modelOpen.value = false
    emit('close')
}

function formatDateForApi(date: CalendarDate): string {
    const d = date.toDate(getLocalTimeZone())
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

/** Parse date string to YYYY-MM-DD. Supports "Jan 1, 2026" and "YYYY-MM-DD". */
function parseDateToApiFormat(dateStr: string): string | null {
    const trimmed = dateStr.trim()
    if (!trimmed) return null
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
    const d = new Date(trimmed)
    if (Number.isNaN(d.getTime())) return null
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function parseCsvHolidays(csvText: string): CsvHolidayRow[] {
    const rows: CsvHolidayRow[] = []
    const lines = csvText.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        let nameTrim: string
        let dateStr: string
        let typeStr: string

        if (values.length >= 4) {
            // Format: Date, Holiday Name, Type → "Jan 1, 2026", "New Year's Day", "National"
            dateStr = `${values[0]}, ${values[1]}`
            nameTrim = values[2] ?? ''
            typeStr = values[3] ?? ''
        } else if (values.length >= 3) {
            // Format: name, date, type (e.g. name, YYYY-MM-DD, type)
            nameTrim = values[0] ?? ''
            dateStr = values[1] ?? ''
            typeStr = values[2] ?? ''
        } else continue

        const typeLower = typeStr.toLowerCase().trim()
        if (!nameTrim || !TYPE_OPTIONS_VALUES.includes(typeLower as typeof TYPE_OPTIONS_VALUES[number])) continue

        const dateApi = parseDateToApiFormat(dateStr)
        if (!dateApi) continue

        rows.push({
            name: nameTrim,
            date: dateApi,
            holiday_type: typeLower === 'restricted' ? 'other' : (typeLower as HolidayType)
        })
    }
    return rows
}

const handleCsvUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
        toast.add({ title: 'Error', description: 'Please upload a CSV file', color: 'error' })
        return
    }
    csvFile.value = file
    csvFileName.value = file.name
    try {
        const text = await file.text()
        const rows = parseCsvHolidays(text)
        if (rows.length === 0) {
            toast.add({
                title: 'Warning',
                description: 'No valid rows found. Use columns: Date, Holiday Name, Type (date like Jan 1, 2026; type: National, Regional, Religious, Cultural, Other, or Restricted)',
                color: 'warning'
            })
            csvFile.value = null
            csvFileName.value = ''
            return
        }
        csvHolidays.value = rows
        selectedCsvHolidays.value = [...rows]
        toast.add({
            title: 'Success',
            description: `Found ${rows.length} holiday(s) in CSV`,
            color: 'success'
        })
    } catch {
        toast.add({ title: 'Error', description: 'Failed to parse CSV file', color: 'error' })
        csvFile.value = null
        csvFileName.value = ''
    }
    target.value = ''
}

const removeCsvFile = () => {
    csvFile.value = null
    csvFileName.value = ''
    csvHolidays.value = []
    selectedCsvHolidays.value = []
}

const selectAllCsvHolidays = () => {
    selectedCsvHolidays.value = [...csvHolidays.value]
}

const deselectAllCsvHolidays = () => {
    selectedCsvHolidays.value = []
}

async function onSubmit() {
    const list: Array<{ name: string; date: string; holiday_type: HolidayType }> = []
    if (hasValidSingle.value) {
        list.push({
            name: state.value.name.trim(),
            date: formatDateForApi(state.value.date),
            holiday_type: toApiHolidayType(state.value.holiday_type)
        })
    }
    list.push(...selectedCsvHolidays.value)

    if (list.length === 0) {
        toast.add({
            title: 'Error',
            description: 'Add at least one holiday (fill the form above or select from CSV)',
            color: 'error'
        })
        return
    }

    try {
        await holidayStore.addHolidays(list)
        modelOpen.value = false
    } catch {
        // Error handled in store
    }
}
</script>
