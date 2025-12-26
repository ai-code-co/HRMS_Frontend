<script setup lang="ts">
const props = defineProps<{
    data: any
}>()
</script>

<template>
    <div class="space-y-6">
        <input v-model="props.data.accountHolder" placeholder="Account Holder Name" class="inputStyles" />
        <input v-model="props.data.bankName" placeholder="Bank Name" class="inputStyles" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input v-model="props.data.accountNumber" placeholder="Account Number" class="inputStyles" />
            <input v-model="props.data.ifsc" placeholder="IFSC Code" class="inputStyles" />
        </div>
    </div>
</template>
