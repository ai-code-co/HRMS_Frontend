<script setup lang="ts">
import { Download } from 'lucide-vue-next';
import {
  Laptop, Smartphone, MousePointer2, Zap, Monitor,
  Keyboard, AirVent, Lightbulb, Camera, CircleDashed,
  Wifi, Headphones
} from 'lucide-vue-next';
import type { DeviceCategory } from '~/types/inventory';
import StatusChart from './StatusChart.vue';

const props = defineProps<{
  categories: DeviceCategory[];
  totalDevices: number;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'select-category', id: string): void;
  (e: 'open-add-modal'): void;
}>();

// Map string names to actual components
// Ensure these match the return values in useInventoryData -> getIconForType
const icons: Record<string, any> = {
  Laptop, Smartphone, MousePointer2, Zap, Monitor,
  Keyboard, AirVent, Lightbulb, Camera, Wifi, Headphones,
  CircleDashed // Fallback
};
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-800 tracking-tight">Inventory</h2>
        <!-- Skeleton Loading for Total -->
        <div v-if="loading" class="h-4 w-32 bg-slate-200 rounded mt-2 animate-pulse"></div>
        <p v-else class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          Total Devices: <span class="text-indigo-600">{{ totalDevices }}</span>
        </p>
      </div>
      <!-- <div class="flex items-center gap-3">
         <button class="px-5 py-3 bg-white border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
            <Download :size="16" />
            Download Report
         </button>
         <button @click="emit('open-add-modal')" class="px-5 py-3 bg-[#4FC3A1] text-white rounded-xl text-[13px] font-bold hover:bg-[#3da688] transition-all shadow-lg shadow-emerald-100 flex items-center gap-2">
            Add Device Type
         </button>
      </div> -->
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in 6" :key="n"
        class="bg-white h-40 rounded-3xl p-6 shadow-sm animate-pulse border border-slate-100"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="categories.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400">
      <CircleDashed :size="48" class="mb-4 text-slate-300" />
      <p>No inventory data found.</p>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="cat in categories" :key="cat.id" @click="emit('select-category', cat.id)"
        class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between">
        <div class="space-y-3">
          <h3 class="font-bold text-slate-700 text-sm tracking-tight mb-2 flex items-center gap-2 uppercase">
            <!-- Safe Icon Rendering with Fallback -->
            <component :is="icons[cat.icon] || icons['CircleDashed']" :size="18" class="text-slate-400" />
            {{ cat.name }}
          </h3>
          <div class="space-y-1.5">
            <div class="flex items-center gap-3">
              <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest min-w-[80px]">Total:</span>
              <span class="text-xs font-black text-slate-800">{{ cat.total }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest min-w-[80px]">Working:</span>
              <span class="text-xs font-black text-slate-800">{{ cat.working }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span
                class="text-[10px] font-bold text-slate-300 uppercase tracking-widest min-w-[80px]">Unassigned:</span>
              <span class="text-xs font-black text-slate-800">{{ cat.unassigned }}</span>
            </div>
          </div>
        </div>

        <!-- Status Chart: Safe Division by zero check -->
        <StatusChart :percentage="cat.total > 0 ? Math.round((cat.working / cat.total) * 100) : 0"
          :total="cat.working" />
      </div>
    </div>
  </div>
</template>