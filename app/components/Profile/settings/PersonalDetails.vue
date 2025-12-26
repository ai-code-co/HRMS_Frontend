<script setup lang="ts">
const props = defineProps<{
    data: any
}>()
</script>

<template>
    <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input v-model="props.data.firstName" placeholder="First Name" class="inputStyles" />
            <input v-model="props.data.lastName" placeholder="Last Name" class="inputStyles" />
        </div>
        <input v-model="props.data.maritalStatus" placeholder="Marital Status" class="inputStyles" />
        <textarea rows="2" v-model="props.data.currentAddress" placeholder="Current Address"
            class="inputStyles"></textarea>
        <textarea rows="2" v-model="props.data.permanentAddress" placeholder="Permanent Address"
            class="inputStyles"></textarea>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input v-model="props.data.contactNumber" placeholder="Personal Contact" class="inputStyles" />
            <input v-model="props.data.emergencyContact" placeholder="Emergency Contact" class="inputStyles" />
        </div>
    </div>
</template>
