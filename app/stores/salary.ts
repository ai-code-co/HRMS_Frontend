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
    status: 'Paid' | 'Processing' | 'Failed' | 'On Hold'
    paymentDate: string
    payslipId: string
    bankName: string
    accNumber: string
    earnings: BreakdownItem[]
    deductions_list: BreakdownItem[]
}

export interface SalaryStructure {
    basic: number
    hra: number
    conveyance: number
    special: number
    pf: number
    tax: number
    professionalTax: number
    insurance: number
}

export interface EmployeeDisbursement {
    id: string
    name: string
    avatar: string
    designation: string
    netPaid: number
    status: 'Paid' | 'Processing' | 'Failed' | 'On Hold'
    paymentDate: string
}

export interface OrgPayrollStats {
    monthlyPayroll: number
    monthlyPayrollTrend: number
    totalDeductions: number
    deductionsTrend: number
    paidEmployees: number
    paidEmployeesTrend: number
    totalEmployees: number
    processingCount: number
    processingTrend: number
}

export interface CostDistribution {
    coreSalaries: number
    bonuses: number
    misc: number
    budgetUsed: number
}

export interface ComplianceStatus {
    verifiedPercent: number
    pendingVerification: number
}

export const useSalaryStore = defineStore('salary', {
    state: () => ({
        records: [] as SalaryRecord[],
        selectedRecordId: '',
        annualCtc: 0,
        isLoading: false,
        // Admin/Org state
        orgStats: null as OrgPayrollStats | null,
        costDistribution: null as CostDistribution | null,
        complianceStatus: null as ComplianceStatus | null,
        recentDisbursements: [] as EmployeeDisbursement[],
        salaryStructure: {
            basic: 8500,
            hra: 3200,
            conveyance: 1200,
            special: 1300,
            pf: 450,
            tax: 1000,
            professionalTax: 200,
            insurance: 100
        } as SalaryStructure
    }),
    getters: {
        selectedRecord: (state): SalaryRecord | null =>
            state.records.find(r => r.id === state.selectedRecordId) || state.records[0] || null,
        grossEarnings: (state): number =>
            state.salaryStructure.basic + state.salaryStructure.hra +
            state.salaryStructure.conveyance + state.salaryStructure.special,
        totalDeductions: (state): number =>
            state.salaryStructure.pf + state.salaryStructure.tax +
            state.salaryStructure.professionalTax + state.salaryStructure.insurance,
        netSalary(): number {
            return this.grossEarnings - this.totalDeductions
        }
    },
    actions: {
        async fetchSalaryData(showGlobalLoader = false, userId?: number | null) {
            this.isLoading = true;
            const { showLoader, hideLoader } = useGlobalLoader()

            if (showGlobalLoader && import.meta.client) {
                showLoader()
            }
            try {
                let params: Record<string, any> = {}
                if (userId) {
                    params.userid = userId
                }
                const response = await useApi(`api/payroll/user-salary-info/`, { params });
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
                if (showGlobalLoader && import.meta.client) {
                    hideLoader()
                }
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
        },

        async fetchOrgPayrollData(showGlobalLoader = false) {
            this.isLoading = true;
            const { showLoader, hideLoader } = useGlobalLoader()

            if (showGlobalLoader && import.meta.client) {
                showLoader()
            }

            try {
                // Mock data for organization payroll stats
                // Replace with actual API call when available
                this.orgStats = {
                    monthlyPayroll: 1420000,
                    monthlyPayrollTrend: 2.4,
                    totalDeductions: 218000,
                    deductionsTrend: 0.8,
                    paidEmployees: 1142,
                    paidEmployeesTrend: 12,
                    totalEmployees: 1248,
                    processingCount: 106,
                    processingTrend: -4
                };

                this.costDistribution = {
                    coreSalaries: 72,
                    bonuses: 18,
                    misc: 10,
                    budgetUsed: 1400000
                };

                this.complianceStatus = {
                    verifiedPercent: 98.4,
                    pendingVerification: 42
                };

                return {
                    orgStats: this.orgStats,
                    costDistribution: this.costDistribution,
                    complianceStatus: this.complianceStatus
                };
            } catch (error: any) {
                const toast = useToast()
                toast.add({
                    title: 'Error',
                    description: extractErrorMessage(error, 'Failed to fetch organization payroll data'),
                    color: 'error'
                })
                return null;
            } finally {
                this.isLoading = false;
                if (showGlobalLoader && import.meta.client) {
                    hideLoader()
                }
            }
        },

        setOrgPayrollData(data: any) {
            if (data?.orgStats) this.orgStats = data.orgStats;
            if (data?.costDistribution) this.costDistribution = data.costDistribution;
            if (data?.complianceStatus) this.complianceStatus = data.complianceStatus;
        },

        updateSalaryStructure(structure: SalaryStructure) {
            this.salaryStructure = { ...structure };
        },

        setSalaryStructureForEmployee(employeeId: number | null) {
            // Set different structures based on employee
            // This can be replaced with API call to get actual structure
            if (employeeId) {
                // Mock different structure for specific employees
                this.salaryStructure = {
                    basic: 10500,
                    hra: 4200,
                    conveyance: 1500,
                    special: 1700,
                    pf: 550,
                    tax: 1200,
                    professionalTax: 250,
                    insurance: 150
                };
            } else {
                this.salaryStructure = {
                    basic: 8500,
                    hra: 3200,
                    conveyance: 1200,
                    special: 1300,
                    pf: 450,
                    tax: 1000,
                    professionalTax: 200,
                    insurance: 100
                };
            }
        }
    }
})