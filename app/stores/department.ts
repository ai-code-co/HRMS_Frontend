import { defineStore } from 'pinia'
import type { DepartmentDetail, DesignationDetail } from '~/types/employee'
import { extractErrorMessage } from '~/composables/useErrorMessage'

type DepartmentListResponse = {
    count?: number
    results?: DepartmentDetail[]
}

type DesignationListResponse = {
    count?: number
    results?: DesignationDetail[]
}

export const useDepartmentStore = defineStore('department', {
    state: () => ({
        departments: [] as DepartmentDetail[],
        designations: [] as DesignationDetail[],
        loading: false,
        designationLoading: false,
        error: null as string | null,
    }),

    getters: {
        departmentOptions: (state) => {
            return state.departments
                .filter(dep => dep.is_active !== false)
                .map(dep => ({
                    label: dep.name,
                    value: dep.id,
                }))
        },

        designationOptions: (state) => {
            return state.designations
                .filter(des => des.is_active !== false)
                .map(des => ({
                    label: des.name,
                    value: des.id,
                    department: des.department,
                }))
        },
    },

    actions: {
        async fetchDepartments() {
            this.loading = true
            this.error = null
            try {
                const data = await useApi<DepartmentListResponse | DepartmentDetail[]>(
                    '/api/departments/',
                    { credentials: 'include' }
                )

                if (Array.isArray(data)) {
                    this.departments = data
                } else {
                    this.departments = data.results ?? []
                }
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch departments')
                this.departments = []
                const toast = useToast()
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error',
                })
            } finally {
                this.loading = false
            }
        },

        async fetchDesignations(departmentId: number) {
            this.designationLoading = true
            this.error = null
            try {
                const data = await useApi<DesignationListResponse | DesignationDetail[]>(
                    '/api/departments/designations/',
                    { credentials: 'include', params: { department: departmentId } }
                )

                if (Array.isArray(data)) {
                    this.designations = data
                } else {
                    this.designations = data.results ?? []
                }
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch designations')
                this.designations = []
                const toast = useToast()
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error',
                })
            } finally {
                this.designationLoading = false
            }
        },

        clearDesignations() {
            this.designations = []
        },
    },
})
