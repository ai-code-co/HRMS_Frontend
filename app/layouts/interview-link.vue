<template>
    <div class="min-h-screen bg-[#F8FAFC] flex flex-col">
        <header class="shrink-0 border-b border-slate-200 bg-white shadow-sm">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <UIcon name="i-lucide-mic" class="text-indigo-600 size-5" />
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-slate-800 tracking-tight">Interview</h1>
                        <p class="text-xs text-slate-500">Complete your interview questions</p>
                    </div>
                </div>
            </div>
        </header>
        <main class="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full">
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'LayoutInterviewLink',
})
</script>
