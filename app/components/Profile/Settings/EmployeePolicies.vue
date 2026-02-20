<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '~/stores/settings'
import type { PolicyItem } from '~/components/Settings/PolicyCard.vue'

const settingsStore = useSettingsStore()
const { policies: policyDocuments, loadingPolicies } = storeToRefs(settingsStore)

onMounted(async () => {
    if (policyDocuments.value.length === 0 && !loadingPolicies.value) {
        await settingsStore.fetchPolicyDocuments()
    }
})

const policies = computed(() => {
    return policyDocuments.value.filter(policy => policy.isApplied)
})

const isPdfLink = (link?: string) => {
    if (!link) return false
    return link.toLowerCase().includes('.pdf')
}

const viewModalOpen = ref(false)
const policyToView = ref<PolicyItem | null>(null)

const openPolicyModal = (policy: any) => {
    if (!policy.link) return
    policyToView.value = {
        id: String(policy.id ?? ''),
        name: policy.name ?? 'Policy',
        link: policy.link,
        docType: policy.docType ?? 'Policy',
        visibility: policy.visibility ?? 'Policy',
        date: policy.date ?? '',
        isApplied: policy.isApplied ?? true,
    }
    viewModalOpen.value = true
}

const closePolicyModal = () => {
    policyToView.value = null
}

</script>

<template>
    <section class="w-full max-w-5xl space-y-4">
        <div class="flex items-center justify-end">
            <span class="text-xs text-slate-400">{{ policies.length }} total</span>
        </div>

        <div v-if="loadingPolicies" class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <div class="text-center space-y-4">
                <UIcon name="i-lucide-loader-2" class="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                <p class="text-sm font-semibold text-slate-700">Loading policies...</p>
            </div>
        </div>

        <div v-else-if="policies.length === 0"
            class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                <UIcon name="i-heroicons-shield-check" class="h-6 w-6 text-slate-400" />
            </div>
            <p class="text-sm font-semibold text-slate-700">No policies applied yet</p>
            <p class="text-xs text-slate-500">Applied policies will appear here.</p>
        </div>

        <div v-else class="space-y-3">
            <div v-for="policy in policies" :key="policy.id"
                class="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                :class="policy.link ? 'cursor-pointer hover:border-slate-200 hover:shadow-md transition' : ''"
                @click="openPolicyModal(policy)">
                <div class="flex items-start gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                        <UIcon v-if="isPdfLink(policy.link)" name="i-heroicons-document" class="h-5 w-5 text-emerald-600" />
                        <UIcon v-else name="i-heroicons-shield-check" class="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-slate-800">{{ policy.name }}</p>
                        <p class="text-xs text-slate-500">
                            <span class="mr-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                                {{ policy.visibility || policy.docType }}
                            </span>
                            <span v-if="policy.date" class="text-slate-400">
                                Applied {{ policy.date }}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <SettingsModalViewPolicyModal v-model:open="viewModalOpen" :policy="policyToView" @close="closePolicyModal" />
</template>
