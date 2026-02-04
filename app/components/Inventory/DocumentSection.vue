<script setup lang="ts">
import { computed } from 'vue';
import { Upload } from 'lucide-vue-next';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>();

const modelOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
});

const close = () => {
  modelOpen.value = false;
};

const labelStyles = "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1";
const inputStyles = "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all";
</script>

<template>
  <UModal
    v-model:open="modelOpen"
    :ui="{
      overlay: 'bg-slate-900/40 backdrop-blur-sm',
      content: 'w-[95vw] sm:w-full sm:max-w-4xl'
    }"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h3 class="text-lg font-semibold text-slate-800">Upload Documents</h3>
          <p class="text-xs text-slate-500 font-medium">Add new files and manage the directory.</p>
        </div>
        <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer"
          @click="close" />
      </div>
    </template>

    <template #body>
      <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="space-y-4">
              <div>
                <label :class="labelStyles">Document Type</label>
                <select :class="inputStyles">
                  <option>--Select document--</option>
                  <option>Photo</option>
                  <option>Warranty</option>
                  <option>Invoice</option>
                </select>
              </div>
              <div class="pt-2">
                <label :class="labelStyles">Upload Document</label>
                <div class="hidden">
                  <input type="file" id="doc-upload" />
                </div>
              </div>
            </div>

            <div
              class="md:col-span-2 h-48 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center p-6 hover:bg-slate-50 hover:border-indigo-200 transition-all cursor-pointer group">
              <Upload :size="40" class="text-slate-300 mb-4 group-hover:text-indigo-400 transition-colors" />
              <p class="text-xs font-bold text-slate-500 group-hover:text-slate-700">Drop a document here or click to
                select file to upload</p>
            </div>
          </div>
      </div>
    </template>
  </UModal>
</template>