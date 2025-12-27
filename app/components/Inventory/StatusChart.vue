<script setup lang="ts">
const props = defineProps<{
  percentage: number;
  total: number;
}>();

const radius = 38;
const circumference = 2 * Math.PI * radius;
const offset = computed(() => circumference - (props.percentage / 100) * circumference);
</script>

<template>
  <div class="relative w-24 h-24 flex items-center justify-center shrink-0">
    <svg class="w-full h-full transform -rotate-90">
      <circle cx="50%" cy="50%" :r="radius" stroke="#eef2f6" stroke-width="8" fill="transparent" />
      <circle 
        cx="50%" cy="50%" :r="radius" stroke="#10b981" stroke-width="8" 
        :stroke-dasharray="circumference" :stroke-dashoffset="offset" 
        stroke-linecap="round" fill="transparent" 
        class="transition-all duration-1000 ease-out"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-[10px] font-bold text-slate-400 leading-none mb-0.5">Working</span>
      <span class="text-sm font-black text-slate-800">{{ total }}</span>
    </div>
  </div>
</template>