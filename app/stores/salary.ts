// stores/salary.ts
import { defineStore } from 'pinia'

export interface SalaryRecord {
    id: string
    month: string
    year: number
    netPaid: number
    gross: number
    deductions: number
    status: 'Paid' | 'Processing' | 'Failed'
    paymentDate: string
    payslipId: string
    bankName: string
    accNumber: string
}

export const useSalaryStore = defineStore('salary', {
    state: () => ({
        records: [
            { id: '1', month: 'November', year: 2025, netPaid: 12450.00, gross: 14200.00, deductions: 1750.00, status: 'Paid', paymentDate: 'Nov 30, 2025', payslipId: 'PAY-25-11-001', bankName: 'Global Trust Bank', accNumber: '**** 4492' },
            { id: '2', month: 'October', year: 2025, netPaid: 12450.00, gross: 14200.00, deductions: 1750.00, status: 'Paid', paymentDate: 'Oct 31, 2025', payslipId: 'PAY-25-10-024', bankName: 'Global Trust Bank', accNumber: '**** 4492' },
            { id: '3', month: 'September', year: 2025, netPaid: 12850.00, gross: 14600.00, deductions: 1750.00, status: 'Paid', paymentDate: 'Sep 30, 2025', payslipId: 'PAY-25-09-112', bankName: 'Global Trust Bank', accNumber: '**** 4492' },
        ] as SalaryRecord[],
        selectedRecordId: '1',
        annualCtc: 170400.00
    }),
    getters: {
        selectedRecord: (state) => state.records.find(r => r.id === state.selectedRecordId) || state.records[0]
    },
    actions: {
        selectRecord(id: string) {
            this.selectedRecordId = id
        }
    }
})