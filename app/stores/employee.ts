import { defineStore } from 'pinia'
import type { Employee, EmployeeDocumentRecord, EmployeeListResponse, EmployeeCreateUpdate } from '../types/employee'
import { extractErrorMessage } from '~/composables/useErrorMessage'

export const useEmployeeStore = defineStore('employee', {
    state: () => ({
        employee: null as Employee | null,
        employeesList: [] as Employee[],
        loading: false,
        error: null as string | null,
        employeeDocuments: [] as EmployeeDocumentRecord[],
        documentsLoading: false,
        documentsError: null as string | null,
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
            const list = state.employeesList.map(emp => ({
                id: emp.id,
                label: `${emp.full_name} (${emp.employee_id})`,
                value: emp.id,
                name: emp.full_name,
                employeeId: emp.employee_id,
                designation: (emp as any).designation_name ?? emp.designation_detail?.name ?? '',
                avatar: {
                    src: (emp as any).photo_url ?? emp.photo ?? undefined,
                    alt: emp.full_name
                }
            }));
            console.log('[employeeStore] employeeOptions getter', { employeesListLength: state.employeesList.length, optionsLength: list.length });
            return list;
        },

        isActiveEmployee: (state) => state.employee?.is_active ?? false,
    },

    actions: {
        async uploadEmployeeFile(file: File) {
            const toast = useToast()
            try {
                const uploadFormData = new FormData()
                uploadFormData.append('file', file)

                const response = await useApi<{
                    success: boolean
                    url: string
                    public_id: string
                    resource_type: string
                }>('/auth/upload-file/', {
                    method: 'POST',
                    body: uploadFormData,
                    credentials: 'include',
                })

                if (!response?.success) {
                    throw new Error('File upload failed')
                }

                return response
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to upload file')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                throw err
            }
        },
        async deleteEmployeeDocument(documentId: string | number) {
            const toast = useToast()
            this.error = null
            try {
                await useApi(`/api/employees/all-documents/${documentId}/`, {
                    method: 'DELETE',
                    credentials: 'include',
                })

                if (this.employee) {
                    const target = this.employee as any
                    const keys = ['documents', 'employee_documents', 'doc_links']
                    keys.forEach((key) => {
                        if (!Array.isArray(target[key])) return
                        target[key] = target[key].filter((doc: any) => {
                            const docId = doc?.id ?? doc?.document_id ?? doc?.pk ?? doc?.documentId ?? doc?.doc_id
                            return String(docId) !== String(documentId)
                        })
                    })
                    this.employee = { ...target }
                }

                toast.add({
                    title: 'Document deleted',
                    description: 'The document has been removed successfully',
                    color: 'success',
                })
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to delete document')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error',
                })
                throw err
            }
        },
        async fetchEmployeeDocuments(employeeId: number | string) {
            const toast = useToast()
            this.documentsLoading = true
            this.documentsError = null
            try {
                const response = await useApi<any>('/api/employees/all-documents/', {
                    method: 'GET',
                    params: { employee: employeeId },
                    credentials: 'include',
                })

                const payload = response?.data ?? response
                const list = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.results)
                        ? payload.results
                        : Array.isArray(payload?.data)
                            ? payload.data
                            : Array.isArray(payload?.documents)
                                ? payload.documents
                                : []

                this.employeeDocuments = list

                if (this.employee && String(this.employee.id) === String(employeeId)) {
                    const target = this.employee as any
                    target.documents = list
                    this.employee = { ...target }
                }

                return list
            } catch (err: any) {
                this.documentsError = extractErrorMessage(err, 'Failed to fetch employee documents')
                toast.add({
                    title: 'Error',
                    description: this.documentsError,
                    color: 'error',
                })
                return []
            } finally {
                this.documentsLoading = false
            }
        },
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
        async fetchEmployees(params: { department?: number; status?: 'active' | 'inactive' } = {}) {
            console.log('[employeeStore] fetchEmployees called', { params })
            this.loading = true
            this.error = null
            try {
                const query: Record<string, any> = {}
                if (params.department) query.department = params.department
                if (params.status) query.status = params.status

                console.log('[employeeStore] useApi GET /api/employees/', { query })
                const data = await useApi<EmployeeListResponse>('/api/employees/', {
                    credentials: 'include',
                    params: query,
                })
                console.log('[employeeStore] useApi response', { raw: data, hasResults: !!data?.results, resultsLength: data?.results?.length ?? 0 })
                this.employeesList = data.results || []
                console.log('[employeeStore] employeesList set', { length: this.employeesList.length })
            } catch (err: any) {
                console.error('[employeeStore] fetchEmployees error', err)
                this.error = extractErrorMessage(err, 'Failed to fetch employees list')
                this.employeesList = []
                const toast = useToast()
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error',
                })
            } finally {
                this.loading = false
                console.log('[employeeStore] fetchEmployees finished', { loading: this.loading, employeesListLength: this.employeesList.length })
            }
        },

        async fetchExEmployees() {
            this.loading = true
            this.error = null
            try {
                const data = await useApi<
                    EmployeeListResponse |
                    Employee[] |
                    { error?: number; data?: Employee[] }
                >('/api/employees/terminated-list/', {
                    credentials: 'include',
                })

                if (Array.isArray(data)) {
                    this.employeesList = data
                } else if ('results' in data) {
                    this.employeesList = data.results || []
                } else if ('data' in data) {
                    this.employeesList = data.data || []
                } else {
                    this.employeesList = []
                }
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch ex-employees list')
                this.employeesList = []
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

        async updateProfilePhoto(file: File, userId?: number | null) {
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

                const params: Record<string, any> = {}
                if (userId) {
                    params.userid = userId
                }

                const { data: updateResponse } = await useApi<{ data: Employee }>('/api/employees/me/', {
                    method: 'PATCH',
                    body: {
                        photo: publicId
                    },
                    credentials: 'include',
                    params
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
        },

        async updatePersonalDetails(data: Partial<Employee>, userId?: number | null) {
            this.loading = true
            this.error = null
            const toast = useToast()
            try {
                const params: Record<string, any> = {}
                if (userId) {
                    params.userid = userId
                }

                const { data: updated } = await useApi<{ data: Employee }>('/api/employees/me/', {
                    method: 'PATCH',
                    body: data,
                    credentials: 'include',
                    params,
                })

                this.updateEmployee(updated)
                toast.add({
                    title: 'Success',
                    description: 'Personal details updated successfully',
                    color: 'success'
                })
                return updated
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to update personal details')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                throw err
            } finally {
                this.loading = false
            }
        },

        async createEmployee(payload: EmployeeCreateUpdate) {
            this.loading = true
            this.error = null
            const toast = useToast()
            try {
                const created = await useApi<Employee>('/api/employees/', {
                    method: 'POST',
                    body: payload,
                    credentials: 'include',
                })

                // Add to employees list if it exists
                if (created) {
                    this.employeesList.push(created)
                }

                toast.add({
                    title: 'Success',
                    description: 'Employee created successfully',
                    color: 'success'
                })

                return created
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to create employee')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                throw err
            } finally {
                this.loading = false
            }
        },

        async updateBankDetails(data: Record<string, any>, userId?: number | null) {
            this.loading = true
            this.error = null
            const toast = useToast()
            try {
                const params: Record<string, any> = {}
                if (userId) {
                    params.userid = userId
                }

                const updated = await useApi<Employee>('/api/employees/update-bank/', {
                    method: 'PATCH',
                    body: data,
                    credentials: 'include',
                    params,
                })

                this.updateEmployee(updated)
                toast.add({
                    title: 'Success',
                    description: 'Bank details updated successfully',
                    color: 'success'
                })
                return updated
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to update bank details')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                throw err
            } finally {
                this.loading = false
            }
        },

        async changePassword(oldPassword: string, newPassword: string, confirmPassword: string) {
            this.loading = true
            this.error = null
            const toast = useToast()
            try {
                await useApi('/auth/change-password/', {
                    method: 'POST',
                    body: {
                        old_password: oldPassword,
                        new_password: newPassword,
                        confirm_password: confirmPassword,
                    },
                    credentials: 'include',
                })

                toast.add({
                    title: 'Success',
                    description: 'Password updated successfully',
                    color: 'success'
                })
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to update password')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                throw err
            } finally {
                this.loading = false
            }
        },

        async terminateEmployee(employeeId: number) {
            this.loading = true
            this.error = null
            const toast = useToast()
            try {
                await useApi(`/api/employees/${employeeId}/terminate/`, {
                    method: 'POST',
                    credentials: 'include',
                    body: {},
                })

                // Remove from in-memory list if present
                this.employeesList = this.employeesList.filter(emp => emp.id !== employeeId)

                toast.add({
                    title: 'Employee terminated',
                    description: 'The employee has been terminated successfully',
                    color: 'success',
                })
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to terminate employee')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error',
                })
                throw err
            } finally {
                this.loading = false
            }
        }
    },
})
