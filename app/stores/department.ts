import { defineStore } from 'pinia'
import type { DepartmentDetail } from '~/types/employee'
import { extractErrorMessage } from '~/composables/useErrorMessage'

type DepartmentListResponse = {
    count?: number
    results?: DepartmentDetail[]
}

export const useDepartmentStore = defineStore('department', {
    state: () => ({
        departments: [] as DepartmentDetail[],
        loading: false,
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
    },
})
