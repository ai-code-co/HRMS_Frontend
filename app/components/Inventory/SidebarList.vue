<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Filter } from 'lucide-vue-next';
import type { InventoryItem } from '../../types/inventory';

const props = defineProps<{
  items: InventoryItem[];
  selectedId: string | undefined;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', item: InventoryItem): void;
}>();

const searchQuery = ref('');

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.items;
  }
  
  const query = searchQuery.value.toLowerCase().trim();
  return props.items.filter(item => {
    const name = item.name?.toLowerCase() || '';
    const serialNumber = item.serialNumber?.toLowerCase() || '';
    const deviceTypeName = item.devicetypeName?.toLowerCase() || '';
    const assignedTo = item.assignedTo?.toLowerCase() || '';
    
    return name.includes(query) || 
           serialNumber.includes(query) || 
           deviceTypeName.includes(query) || 
           assignedTo.includes(query);
  });
});
</script>

<template>
  <div class="bg-white border border-slate-100 rounded-3xl flex flex-col shadow-sm overflow-hidden shrink-0">
    <div class="p-4 border-b border-slate-50 flex items-center gap-2">
       <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" :size="14" />
          <input 
            type="text" 
            placeholder="Search..." 
            v-model="searchQuery"
            class="w-full bg-slate-50 border-none rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold focus:ring-1 focus:ring-indigo-100 focus:outline-none" 
          />
       </div>
       <button class="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors"><Filter :size="16" /></button>
    </div>
    
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-2 p-4">
        <div v-for="n in 5" :key="n" class="h-20 bg-slate-50 rounded-xl animate-pulse"></div>
      </div>

      <!-- Item List -->
      <template v-else>
        <button 
          v-for="item in filteredItems"
          :key="item.id"
          @click="emit('select', item)"
          class="w-full text-left p-6 border-b border-slate-50 transition-all"
          :class="selectedId === item.id ? 'bg-[#E3F2EE] border-l-4 border-l-[#4FC3A1]' : 'hover:bg-slate-50'"
        >
          <div class="font-bold text-slate-700 text-sm mb-1">{{ item.name }}</div>
          <div class="text-[11px] font-medium text-slate-400">{{ item.type }}</div>
          <div class="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{{ item.serialNumber }}</div>
        </button>
        <div v-if="filteredItems.length === 0 && searchQuery.trim()" class="p-6 text-center text-sm text-slate-400">
          No items found matching "{{ searchQuery }}"
        </div>
      </template>
    </div>
  </div>
</template>