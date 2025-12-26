<script setup lang="ts">
const props = defineProps<{
    profileData: any
}>()

</script>

<template>
    <div class="flex flex-col md:flex-row items-center gap-8">
        <div class="w-44 h-44 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
            <img :src="props.profileData.profileImage || `https://ui-avatars.com/api/?name=${props.profileData.personal.firstName?.[0]}${props.profileData.personal.lastName?.[0]}&background=random`"
                class="w-full h-full object-cover" />
        </div>
        <div class="flex flex-col gap-4">
            <button class="bg-indigo-600 text-white px-6 py-3 rounded-xl">Upload New</button>
            <button class="bg-slate-50 text-slate-500 px-6 py-3 rounded-xl">Remove</button>
        </div>
    </div>
</template>
