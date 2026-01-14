import { defineStore } from 'pinia'
import type { Employee, EmployeeListResponse } from '../types/employee'
import { extractErrorMessage } from '~/composables/useErrorMessage'

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
                avatar: emp.photo,
                designation: emp.designation_name
            }));
        },

        isActiveEmployee: (state) => state.employee?.is_active ?? false,
    },

    actions: {
        async fetchEmployee(showGlobalLoader = false, userId?: number | null) {
            this.loading = true
            this.error = null
            const { showLoader, hideLoader } = useGlobalLoader()

            if (showGlobalLoader && import.meta.client) {
                showLoader()
            }
            try {
                let params: Record<string, any> = {}
                if (userId) {
                    params.userid = userId
                }
                const data = await useApi<Employee>(
                    '/api/employees/me/',
                    { credentials: 'include', params }
                )

                this.employee = data ?? null
                return data ?? null
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to load employee')
                this.employee = null
                return null
            } finally {
                this.loading = false
                if (showGlobalLoader && import.meta.client) {
                    hideLoader()
                }
            }
        },
        setEmployee(data: Employee | null) {
            this.employee = data
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
            this.error = null;
            try {
                const data = await useApi<EmployeeListResponse>('/api/employees/', {
                    credentials: 'include'
                });
                this.employeesList = data.results || [];
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch employees list');
                this.employeesList = [];
                const toast = useToast();
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                });
            } finally {
                this.loading = false;
            }
        },

        async updateProfilePhoto(file: File) {
            const toast = useToast()
            try {
                const uploadFormData = new FormData()
                uploadFormData.append('image', file)

                const uploadResponse = await useApi<{ public_id: string }>('/auth/upload-image/', {
                    method: 'POST',
                    body: uploadFormData,
                    credentials: 'include'
                })

                const publicId = uploadResponse.public_id

                const { data: updateResponse } = await useApi<{ data: Employee }>('/api/employees/me/', {
                    method: 'PATCH',
                    body: {
                        photo: publicId
                    },
                    credentials: 'include'
                })
                await useAuth().initAuth()
                if (updateResponse && this.employee) {
                    this.employee = { ...this.employee, ...updateResponse }
                } else if (updateResponse) {
                    this.employee = updateResponse
                }
                return updateResponse
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to update profile photo')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                throw err
            }
        }
    },
})
