<script setup lang="ts">
import { X } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const deviceTypes = [
  'Hard Disk', 'AC', 'usb charging cable', 'laptop', 'keyboard', 'ups', 
  'Desktop', 'CPU', 'mobile phone', 'Camera', 'Mouse2018', 
  'access card', 'Chargers', 'Lights', 'fans', 'Pen Drive', 
  'Landline Phone', 'Wifi Modem'
];
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-[4px]" 
      @click="emit('close')"
      v-motion-fade
    ></div>
    
    <!-- Modal -->
    <div 
      class="relative z-[110] bg-white shadow-2xl w-full max-w-lg rounded-3xl overflow-hidden m-4"
      v-motion
      :initial="{ opacity: 0, scale: 0.9, y: 20 }"
      :enter="{ opacity: 1, scale: 1, y: 0 }"
    >
       <div class="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <h3 class="text-lg font-black text-slate-500 uppercase tracking-widest">ADD DEVICE TYPE</h3>
          <button @click="emit('close')" class="text-slate-300 hover:text-rose-500 transition-colors"><X :size="20" /></button>
       </div>
       <div class="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <h4 class="text-xs font-bold text-slate-400 mb-4">Device Type List</h4>
          <div class="space-y-3">
             <label v-for="type in deviceTypes" :key="type" class="flex items-center gap-4 group cursor-pointer">
               <input type="checkbox" class="w-5 h-5 rounded-md border-slate-200 text-indigo-600 focus:ring-indigo-100 transition-all" />
               <span class="text-sm font-semibold text-slate-500 group-hover:text-slate-800 transition-colors capitalize">{{ type }}</span>
             </label>
          </div>
       </div>
       <div class="px-8 py-6 bg-slate-50/30 border-t border-slate-50 flex justify-end gap-6">
          <button @click="emit('close')" class="text-xs font-black text-[#FF7675] uppercase tracking-widest hover:opacity-80 transition-opacity">DELETE</button>
          <button @click="emit('close')" class="text-xs font-black text-[#4FC3A1] uppercase tracking-widest hover:opacity-80 transition-opacity">CANCEL</button>
       </div>
    </div>
  </div>
</template>