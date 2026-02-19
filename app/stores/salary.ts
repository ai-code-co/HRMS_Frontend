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
    medicalAllowance: number
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

export interface OrgSalaryStatement {
    id: number
    user_Id: string
    month: number
    year: number
    month_name: string
    total_leave_taken: string
    leave_balance: string
    allocated_leaves: string
    paid_leaves: string
    unpaid_leaves: string
    final_leave_balance: string
    status: string
    misc_deduction_2: string
    bonus: string
    total_working_days: string
    total_earnings: string
    total_deductions: string
    total_taxes: string
    total_net_salary: string
    statement_reference: string
    bank_details: { bank_name?: string; account_number?: string; masked_account_number?: string }
    earnings_breakdown: BreakdownItem[]
    deductions_breakdown: BreakdownItem[]
}

export const useSalaryStore = defineStore('salary', {
    state: () => ({
        records: [] as SalaryRecord[],
        selectedRecordId: '',
        annualCtc: 0,
        isLoading: false,
        // Admin/Org state
        orgSalaryStatements: [] as OrgSalaryStatement[],
        orgStats: null as OrgPayrollStats | null,
        costDistribution: null as CostDistribution | null,
        complianceStatus: null as ComplianceStatus | null,
        recentDisbursements: [] as EmployeeDisbursement[],
        salaryStructure: {
            basic: 8500,
            hra: 3200,
            medicalAllowance: 0,
            conveyance: 0,
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
            state.salaryStructure.medicalAllowance + state.salaryStructure.conveyance + state.salaryStructure.special,
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
                this.annualCtc = response.data?.annual_ctc ?? 0;

                const payslipMonths = response.data?.payslip_months
                this.records = Array.isArray(payslipMonths) ? payslipMonths.map((m: any) => ({
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
                })) : [];

                if (response.data?.selected_payslip) {
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
            const record = index !== -1 ? this.records[index] : null;
            if (!record) return;
            this.records[index] = {
                ...record,
                gross: parseFloat(data.total_earnings),
                deductions: parseFloat(data.total_deductions),
                bankName: data.bank_details?.bank_name || 'N/A',
                accNumber: data.bank_details?.masked_account_number || 'N/A',
                earnings: Array.isArray(data.earnings_breakdown) ? data.earnings_breakdown : [],
                deductions_list: Array.isArray(data.deductions_breakdown) ? data.deductions_breakdown : []
            };
            this.setSalaryStructureFromRecord(this.records[index] as SalaryRecord);
        },

        /**
         * Derive SalaryStructure from a record's earnings/deductions (API breakdown).
         * Matches labels case-insensitively (e.g. "Basic Salary" -> basic, "Provident Fund" -> pf).
         */
        setSalaryStructureFromRecord(record: SalaryRecord | null) {
            if (!record || (!record.earnings?.length && !record.deductions_list?.length)) return;
            const match = (items: BreakdownItem[], ...keywords: string[]) =>
                items.find(i => keywords.some(k => i.label.toLowerCase().includes(k)))?.amount ?? 0;
            const earnings = record.earnings || [];
            const deductions = record.deductions_list || [];
            this.salaryStructure = {
                basic: match(earnings, 'basic'),
                hra: match(earnings, 'hra', 'house rent'),
                medicalAllowance: match(earnings, 'medical'),
                conveyance: match(earnings, 'conveyance'),
                special: match(earnings, 'special'),
                pf: match(deductions, 'provident', 'pf'),
                tax: match(deductions, 'tax', 'tds'),
                professionalTax: match(deductions, 'professional'),
                insurance: match(deductions, 'insurance')
            };
        },

        /**
         * Fetches org-wide payroll for admin. Uses api/payroll/user-salary-info/
         * - No query → returns all employees' payslips (data.payslips)
         * - Optional: month (1-12), year (e.g. 2025). Do not pass userid/employee_id for org view.
         */
        async fetchOrgPayrollData(showGlobalLoader = false, params?: { month?: number; year?: number }) {
            this.isLoading = true;
            const { showLoader, hideLoader } = useGlobalLoader()

            if (showGlobalLoader && import.meta.client) {
                showLoader()
            }

            try {
                const query: Record<string, number> = {}
                if (params?.month != null) query.month = params.month
                if (params?.year != null) query.year = params.year

                const raw = await useApi<any>('api/payroll/user-salary-info/', {
                    credentials: 'include',
                    params: Object.keys(query).length ? query : undefined
                })
                const statements = Array.isArray(raw)
                    ? raw
                    : (raw?.data?.payslips ?? raw?.payslips ?? raw?.data ?? raw?.results ?? raw?.list ?? [])
                const list = Array.isArray(statements) ? statements : []

                this.orgSalaryStatements = list

                const totalPayroll = list.reduce((sum, s) => sum + parseFloat(s.total_net_salary || '0'), 0)
                const totalDeductions = list.reduce((sum, s) => sum + parseFloat(s.total_deductions || '0'), 0)
                const paidCount = list.filter(s => (s.status || '').toLowerCase() === 'paid').length
                const processingCount = list.filter(s => (s.status || '').toLowerCase() === 'processing').length

                this.orgStats = {
                    monthlyPayroll: Math.round(totalPayroll),
                    monthlyPayrollTrend: 0,
                    totalDeductions: Math.round(totalDeductions),
                    deductionsTrend: 0,
                    paidEmployees: paidCount,
                    paidEmployeesTrend: 0,
                    totalEmployees: list.length,
                    processingCount,
                    processingTrend: 0
                }

                const totalEarnings = list.reduce((sum, s) => sum + parseFloat(s.total_earnings || '0'), 0)
                this.costDistribution = {
                    coreSalaries: totalPayroll > 0 ? Math.round((totalPayroll / totalEarnings) * 72) : 72,
                    bonuses: 18,
                    misc: 10,
                    budgetUsed: Math.round(totalPayroll)
                }

                this.complianceStatus = {
                    verifiedPercent: 98.4,
                    pendingVerification: 42
                }

                return {
                    orgStats: this.orgStats,
                    costDistribution: this.costDistribution,
                    complianceStatus: this.complianceStatus,
                    orgSalaryStatements: this.orgSalaryStatements
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
            if (Array.isArray(data?.orgSalaryStatements)) this.orgSalaryStatements = data.orgSalaryStatements;
        },

        updateSalaryStructure(structure: SalaryStructure) {
            this.salaryStructure = { ...structure };
        },

        /**
         * Update salary structure via API. Identifier can be SalaryStructure.id or Employee.employee_id (e.g. EMP8413).
         * Maps our structure to SalaryStructureAdminUpdate (decimal strings, epf/tds).
         */
        async updateSalaryStructureApi(identifier: string, structure: SalaryStructure) {
            const toDecimal = (n: number) => String(Number(n) || 0);
            const body = {
                basic_salary: toDecimal(structure.basic),
                hra: toDecimal(structure.hra),
                medical_allowance: toDecimal(structure.medicalAllowance),
                conveyance_allowance: toDecimal(structure.conveyance),
                special_allowance: toDecimal(structure.special),
                epf: toDecimal(structure.pf),
                tds: toDecimal(structure.tax),
                is_active: true
            };
            try {
                await useApi(`api/payroll/salary-structure/${encodeURIComponent(identifier)}/update/`, {
                    method: 'PATCH',
                    body
                });
                this.updateSalaryStructure(structure);
                return true;
            } catch (error: any) {
                const toast = useToast();
                toast.add({
                    title: 'Error',
                    description: extractErrorMessage(error, 'Failed to update salary structure'),
                    color: 'error'
                });
                return false;
            }
        },

        setSalaryStructureForEmployee(employeeId: number | null) {
            // Set different structures based on employee
            // This can be replaced with API call to get actual structure
            if (employeeId) {
                // Mock different structure for specific employees
                this.salaryStructure = {
                    basic: 10500,
                    hra: 4200,
                    medicalAllowance: 1500,
                    conveyance: 500,
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
                    medicalAllowance: 0,
                    conveyance: 0,
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