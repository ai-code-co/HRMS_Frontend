<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useInventoryStore } from '~/stores/inventory';

const props = defineProps<{
  deviceId: string | undefined;
}>();

const store = useInventoryStore();
const { deviceComments: comments, loadingComments: loading } = storeToRefs(store);

watch(() => props.deviceId, (id) => store.fetchDeviceComments(id), { immediate: true });
</script>

<template>
  <div class="w-full lg:w-72 space-y-6 flex flex-col justify-between">
     <div class="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
        <p v-if="loading" class="text-xs text-slate-500 py-2">Loading comments...</p>
        <template v-else-if="comments.length === 0 && deviceId">
          <p class="text-xs text-slate-500 py-2">No comments yet.</p>
        </template>
        <div v-else v-for="comment in comments" :key="comment.id" class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div class="flex items-center gap-3 mb-2">
             <img :src="comment.avatar" alt="" class="w-8 h-8 rounded-full bg-white border border-slate-200 object-cover" />
             <div>
                <p class="text-[11px] font-black text-slate-800">{{ comment.author }}</p>
                <p class="text-[9px] font-bold text-slate-300">{{ comment.date }}</p>
             </div>
          </div>
          <p class="text-xs font-medium text-slate-600 leading-relaxed">{{ comment.text }}</p>
        </div>
     </div>
     <!-- <div class="relative">
        <textarea 
          v-model="newComment"
          rows="2" 
          placeholder="Type comment..." 
          class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium resize-none focus:outline-none focus:ring-1 focus:ring-indigo-100" 
        />
        <button class="absolute right-3 bottom-3 text-indigo-500 hover:text-indigo-600"><Send :size="16" /></button>
     </div> -->
  </div>
</template>