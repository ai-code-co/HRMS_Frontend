<script setup lang="ts">
import { DownloadCloud, FileImage } from 'lucide-vue-next';

const props = defineProps<{
  documents?: Record<string, { name: string; url: string }>;
}>();

const documentTypes = ['Photo', 'Warranty', 'Invoice'] as const;

const getDocForType = (type: string) => {
  const key = type.toLowerCase();
  return props.documents?.[key] || null;
};

const downloadFile = (type: string) => {
  const doc = getDocForType(type);
  if (!doc) return;
  
  const link = document.createElement('a');
  link.href = doc.url;
  link.download = doc.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<template>
  <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 shrink-0 w-full xl:w-72">
    <h4 class="text-base font-black text-slate-800 tracking-tight">Documents</h4>
    <div class="space-y-4">
      <div
        v-for="(doc, i) in documentTypes"
        :key="doc"
        class="flex items-center justify-between p-2 rounded-xl group hover:bg-slate-50 transition-colors"
      >
        <div class="flex items-center gap-4">
          <span
            class="w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center border"
            :class="getDocForType(doc) ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'"
          >
            {{ i + 1 }}
          </span>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-600">{{ doc }}</span>
            <span v-if="getDocForType(doc)" class="text-[10px] text-emerald-500 font-medium truncate max-w-[120px]">
              {{ getDocForType(doc)!.name }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <!-- Thumbnail preview for images -->
          <img
            v-if="getDocForType(doc)"
            :src="getDocForType(doc)!.url"
            :alt="doc"
            class="w-7 h-7 rounded object-cover border border-slate-200"
          />
          <UTooltip text="Download" v-if="getDocForType(doc)">
            <UButton
              icon="i-heroicons-arrow-down-tray"
              size="xs"
              color="success"
              variant="soft"
              class="rounded-full"
              @click="downloadFile(doc)"
            />
          </UTooltip>
          <div v-else class="p-1.5 text-slate-300">
             <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
