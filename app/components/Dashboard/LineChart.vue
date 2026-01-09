<script setup lang="ts">
import { computed } from 'vue'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'vue-chartjs'

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
    title?: string
    dailyAverage?: string
    data: { date: string; hours: number }[]
}>()

// Extract labels (dates) and data points (hours)
const labels = computed(() => props.data?.map(d => d.date) || [])
const dataPoints = computed(() => props.data?.map(d => d.hours) || [])

// Prepare chart options
const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            enabled: true,
            mode: 'index' as const,
            intersect: false,
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 12,
            cornerRadius: 8,
            titleFont: { size: 14, weight: 'bold' as const },
            bodyFont: { size: 12 }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { font: { size: 12 }, color: '#94a3b8' }
        },
        y: {
            beginAtZero: true,
            suggestedMax: 12,
            ticks: { font: { size: 12 }, color: '#94a3b8' },
            grid: { color: '#e2e8f0', drawBorder: false }
        }
    }
}))

// Prepare reactive chart data
const chartData = computed(() => ({
    labels: labels.value,
    datasets: [
        {
            label: 'Hours Worked',
            data: dataPoints.value,
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#6366F1',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderWidth: 3
        }
    ]
}))
</script>

<template>
    <ClientOnly>
        <template #default>
            <section class="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-black text-slate-800 tracking-tight">
                            {{ title || 'My Productivity' }}
                        </h3>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Last 7 Days</p>
                    </div>
                    <UBadge v-if="dailyAverage" color="primary" variant="soft" size="md"
                        :ui="{ rounded: 'rounded-full' }">
                        Daily Average: {{ dailyAverage }}
                    </UBadge>
                </div>

                <!-- Line Chart -->
                <div class="w-full h-64">
                    <Line :data="chartData" :options="chartOptions" />
                </div>
            </section>
        </template>
        <template #fallback>
            <div class="w-full h-64 flex items-center justify-center text-slate-400">
                Loading chart...
            </div>
        </template>
    </ClientOnly>
</template>
