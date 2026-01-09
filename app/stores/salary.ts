import { defineStore } from 'pinia'
import { extractErrorMessage } from '~/composables/useErrorMessage'

export interface BreakdownItem {
    label: string
    amount: number
}

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
    earnings: BreakdownItem[]
    deductions_list: BreakdownItem[]
}

export const useSalaryStore = defineStore('salary', {
    state: () => ({
        records: [] as SalaryRecord[],
        selectedRecordId: '',
        annualCtc: 0,
        isLoading: false
    }),
    getters: {
        selectedRecord: (state): SalaryRecord | null =>
            state.records.find(r => r.id === state.selectedRecordId) || state.records[0] || null
    },
    actions: {
        async fetchSalaryData() {
            this.isLoading = true;
            try {
                const response = await useApi(`api/payroll/user-salary-info/`);
                this.annualCtc = response.data.annual_ctc;

                this.records = response.data.payslip_months.map((m: any) => ({
                    id: m.id.toString(),
                    month: m.month_name,
                    year: m.year,
                    netPaid: parseFloat(m.total_net_salary),
                    gross: 0,
                    deductions: 0,
                    status: m.status,
                    paymentDate: m.formatted_date,
                    payslipId: m.statement_reference,
                    bankName: '',
                    accNumber: '',
                    earnings: [],
                    deductions_list: []
                }));

                if (response.data.selected_payslip) {
                    this.updateRecordDetails(response.data.selected_payslip);
                    this.selectedRecordId = response.data.selected_payslip.id.toString();
                }

                return {
                    records: this.records,
                    annualCtc: this.annualCtc,
                    selectedRecordId: this.selectedRecordId
                };
            } catch (error: any) {
                const toast = useToast()
                toast.add({
                    title: 'Error',
                    description: extractErrorMessage(error, 'Failed to fetch salary data'),
                    color: 'error'
                })
                return null;
            } finally {
                this.isLoading = false;
            }
        },

        setSalaryData(data: { records: SalaryRecord[], annualCtc: number, selectedRecordId: string }) {
            this.records = data.records;
            this.annualCtc = data.annualCtc;
            this.selectedRecordId = data.selectedRecordId;
        },

        async selectRecord(id: string) {
            const record = this.records.find(r => r.id === id);
            if (!record) return;

            this.selectedRecordId = id;

            if (record.gross === 0) {
                try {
                    const response = await useApi(`api/payroll/user-salary-info/?month=${record.month}&year=${record.year}`);
                    this.updateRecordDetails(response.data.selected_payslip);
                } catch (error: any) {
                    const toast = useToast()
                    toast.add({
                        title: 'Error',
                        description: extractErrorMessage(error, 'Failed to fetch month details'),
                        color: 'error'
                    })
                }
            }
        },

        updateRecordDetails(data: any) {
            const index = this.records.findIndex(r => r.id === data.id.toString());
            if (index !== -1) {
                this.records[index] = {
                    ...this.records[index],
                    gross: parseFloat(data.total_earnings),
                    deductions: parseFloat(data.total_deductions),
                    bankName: data.bank_details?.bank_name || 'N/A',
                    accNumber: data.bank_details?.masked_account_number || 'N/A',
                    earnings: data.earnings_breakdown,
                    deductions_list: data.deductions_breakdown
                };
            }
        }
    }
})