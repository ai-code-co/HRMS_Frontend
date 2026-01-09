<script setup lang="ts">
import { computed } from 'vue'
import LineChart from './LineChart.vue'

const props = defineProps<{
  role: 'admin' | 'user'
  data: { date: string; hours: number }[]
  dailyAverage?: string
}>()

const chartTitle = computed(() =>
  props.role === 'admin' ? 'Attendance Trends' : 'My Productivity'
)

const dailyAverage = computed(() => props.dailyAverage || '0h')
</script>

<template>
  <LineChart
    :title="chartTitle"
    :daily-average="dailyAverage"
    :data="props.data || []"
  />
</template>