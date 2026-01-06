<script setup lang="ts">
import { Award, Smile } from 'lucide-vue-next';

defineProps<{
    title: string;
    description: string;
    action: string;
}>();
</script>

<template>
    <section
        class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl shadow-indigo-100 overflow-hidden relative group h-full flex flex-col justify-between">
        <div
            class="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-125 transition-transform duration-700">
            <Award :size="140" />
        </div>
        <div class="relative z-10">
            <Smile class="mb-4 text-indigo-200" :size="32" />
            <h4 class="text-lg font-black tracking-tight mb-2">{{ title }}</h4>
            <p class="text-indigo-100 text-xs font-medium leading-relaxed opacity-80">
                {{ description }}
            </p>
        </div>
        <button
            class="relative z-10 mt-6 w-full py-3 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/30 transition-all">
            {{ action }}
        </button>
    </section>
</template>