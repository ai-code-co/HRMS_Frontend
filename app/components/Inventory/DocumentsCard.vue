<script setup lang="ts">
import { DownloadCloud } from 'lucide-vue-next';

const documentTypes = ['Photo', 'Warranty', 'Invoice'] as const;
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
            class="w-6 h-6 rounded-full bg-slate-50 text-[10px] font-black text-slate-400 flex items-center justify-center border border-slate-100"
          >
            {{ i + 1 }}
          </span>
          <span class="text-xs font-bold text-slate-600">{{ doc }}</span>
        </div>
        <button
          type="button"
          class="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
          aria-label="Download"
        >
          <DownloadCloud :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
