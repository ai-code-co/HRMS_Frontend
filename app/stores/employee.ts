import { defineStore } from 'pinia'
import type { Employee, EmployeeListResponse } from '../types/employee'

export const useEmployeeStore = defineStore('employee', {
    state: () => ({
        employee: null as Employee | null,
        employeesList: [] as Employee[],
        loading: false,
        error: null as string | null,
    }),

    getters: {
        isLoggedIn: (state) => !!state.employee,

        fullName: (state) => state.employee?.full_name ?? '',

        departmentName: (state) =>
            state.employee?.department_detail?.name ?? '',

        designationName: (state) =>
            state.employee?.designation_detail?.name ?? '',

        managerName: (state) =>
            state.employee?.department_detail?.manager_name ?? '',

        employeeOptions: (state) => {
            return state.employeesList.map(emp => ({
                id: emp.id,
                label: `${emp.full_name} (${emp.employee_id})`,
                value: emp.id,
                // Extra data for custom display if needed
                avatar: emp.photo,
                designation: emp.designation_name
            }));
        },

        isActiveEmployee: (state) => state.employee?.is_active ?? false,
    },

    actions: {
        async fetchEmployee() {
            this.loading = true
            this.error = null

            try {
                const data = await useApi<Employee>(
                    '/api/employees/me/',
                    { credentials: 'include' }
                )

                this.employee = data ?? null
            } catch (err: any) {
                this.error = err?.message || 'Failed to load employee'
                this.employee = null
            } finally {
                this.loading = false
            }
        },
        clearEmployee() {
            this.employee = null
            this.error = null
        },

        updateEmployee(partial: Partial<Employee>) {
            if (!this.employee) return
            this.employee = { ...this.employee, ...partial }
        },
        async fetchEmployees() {
            this.loading = true;
            try {
                const data = await useApi<EmployeeListResponse>('/api/employees/', {
                    credentials: 'include'
                });
                this.employeesList = data.results || [];
            } catch (err: any) {
                console.error('Failed to fetch employees list', err);
                this.employeesList = [];
            } finally {
                this.loading = false;
            }
        }
    },
})
