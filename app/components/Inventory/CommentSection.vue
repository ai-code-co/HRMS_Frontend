<script setup lang="ts">
import { HistoryIcon } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { useInventoryStore } from '~/stores/inventory';

const props = defineProps<{
  deviceId: string | undefined;
}>();

const store = useInventoryStore();
const { deviceComments: comments, loadingComments: loading } = storeToRefs(store);

watch(() => props.deviceId, (id) => store.fetchDeviceComments(id), { immediate: true });

const timelineItems = computed(() =>
  comments.value.map((c) => ({
    date: c.date,
    title: c.author,
    description: c.text,
    avatar: c.avatar ? { src: c.avatar } : undefined,
  }))
);
</script>

<template>
  <div class="w-full space-y-4">
    <h3 class="text-lg font-black text-blue-700 flex gap-2 items-center">
      <HistoryIcon />
      Device History
    </h3>

    <p v-if="loading" class="text-xs text-slate-500 py-2">Loading comments...</p>
    <template v-else-if="timelineItems.length === 0 && deviceId">
      <div class="text-center py-8 text-slate-400">
        <UIcon name="i-lucide-history" class="w-8 h-8 mb-2" />
        <p class="text-sm font-medium">No history available</p>
      </div>
    </template>
    <UTimeline
      v-else
      :items="timelineItems"
      color="primary"
      size="md"
      :ui="{
        date: 'float-end ms-1',
        description: 'px-3 py-2 ring ring-default mt-2 rounded-md text-default',
      }"
    >
      <template #indicator="{ item }">
        <UAvatar v-if="item.avatar?.src" :src="item.avatar.src" size="md" />
        <UIcon v-else name="i-lucide-message-circle" class="w-4 h-4" />
      </template>
      <template #title="{ item }">
        <span class="font-bold text-slate-700">{{ item.title }}</span>
      </template>
      <template #description="{ item }">
        <p class="text-slate-500 text-sm">{{ item.description }}</p>
      </template>
    </UTimeline>
  </div>
</template>