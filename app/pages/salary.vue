<template>
    <div class="flex flex-col h-full bg-[#F8FAFC]">

        <SalaryHeader :annualCtc="store.annualCtc" />

        <div class="flex-1 flex flex-col lg:flex-row p-4 md:p-8 gap-8 overflow-hidden">
            <aside class="w-full lg:w-88 space-y-4 overflow-y-auto custom-scrollbar shrink-0">
                <SalarySideBar v-for="record in store.records" :key="record.id" :record="record"
                    :selected="store.selectedRecordId === record.id" @select="store.selectRecord(record.id)" />
            </aside>
            <main class="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div class="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
                    <Transition name="fade-slide" mode="out-in">
                        <div :key="store.selectedRecordId" class="space-y-12">
                            <div class="flex items-start justify-between">
                                <div>
                                    <h2 class="text-3xl font-black text-slate-800 tracking-tight mb-2">
                                        {{ store.selectedRecord.month }} {{ store.selectedRecord.year }}
                                    </h2>
                                    <div class="flex items-center gap-3 text-xs font-bold text-slate-400">
                                        <span>Statement Reference</span>
                                        <span class="w-1 h-1 rounded-full bg-slate-200" />
                                        <span class="uppercase tracking-widest">{{ store.selectedRecord.payslipId
                                        }}</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4">
                                    <div class="hidden sm:flex flex-col items-end">
                                        <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                            NET PAYABLE</p>
                                        <p class="text-2xl font-black text-indigo-600">
                                            ₹ {{ store.selectedRecord.netPaid.toLocaleString() }}
                                        </p>
                                    </div>
                                    <!-- <UButton icon="i-heroicons-document-arrow-down" size="xl" color="primary"
                                        variant="soft" class="rounded-2xl" /> -->
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <SalaryMetadataCard label="GROSS EARNINGS"
                                    :value="`$${store.selectedRecord.gross.toLocaleString()}`" />
                                <SalaryMetadataCard label="TOTAL DEDUCTIONS"
                                    :value="`$${store.selectedRecord.deductions.toLocaleString()}`" is-negative />
                                <SalaryMetadataCard label="BANK" :value="store.selectedRecord.bankName"
                                    :sub-value="`Acc: ${store.selectedRecord.accNumber}`" />
                                <SalaryMetadataCard label="STATUS" :value="store.selectedRecord.status" highlight />
                            </div>

                            <div class="grid grid-cols-1 xl:grid-cols-2 gap-12">
                                <section class="space-y-6">
                                    <div class="flex items-center justify-between border-b border-slate-50 pb-4">
                                        <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest">
                                            Earnings</h4>
                                        <UBadge color="success" variant="subtle" class="text-[9px]">Credits</UBadge>
                                    </div>
                                    <div class="space-y-1">
                                        <SalaryBreakdownRow v-for="item in store.selectedRecord.earnings"
                                            :key="item.label" :label="item.label" :value="item.amount" />
                                    </div>
                                </section>
                                <section class="space-y-6">
                                    <div class="flex items-center justify-between border-b border-slate-50 pb-4">
                                        <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest">
                                            Deductions</h4>
                                        <UBadge color="error" variant="subtle" class="text-[9px]">Debits</UBadge>
                                    </div>
                                    <div class="space-y-1">
                                        <SalaryBreakdownRow v-for="item in store.selectedRecord.deductions_list"
                                            :key="item.label" :label="item.label" :value="item.amount" is-negative />
                                    </div>
                                </section>
                            </div>

                            <div
                                class="bg-slate-50 border border-slate-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div class="flex items-center gap-5">
                                    <div
                                        class="p-4 bg-white text-emerald-500 rounded-2xl shadow-sm border border-slate-100">
                                        <UIcon name="i-heroicons-shield-check" class="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 class="text-base font-black text-slate-800">Transaction Verified</h4>
                                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Electronically generated statement.</p>
                                    </div>
                                </div>
                                <div
                                    class="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    <UIcon name="i-heroicons-building-library" class="w-4 h-4" />
                                    {{ store.selectedRecord.bankName || 'GT-BANK' }} SECURE
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSalaryStore } from '@/stores/salary'

const store = useSalaryStore()

await useAsyncData('attendance', () => {
    return store.fetchSalaryData()
})
</script>