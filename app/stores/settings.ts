import { defineStore } from 'pinia'
import { extractErrorMessage } from '~/composables/useErrorMessage'
import useApi from '~/composables/useApi'

export interface Permission {
    module: string; view: boolean; create: boolean; edit: boolean; delete: boolean;
}

export const useSettingsStore = defineStore('settings', () => {
    const activeMenu = ref('permissions')
    const uploadPolicyModalOpen = ref(false)
    const employeeSearch = ref('')
    const selectedEmployeeId = ref<string | null>(null)
    const isSaving = ref(false)
    const policySaving = ref(false)
    const policyDeleting = ref(false)
    const policyError = ref<string | null>(null)
    const policies = ref<any[]>([])
    const loadingPolicies = ref(false)
    const policyApplying = ref(false)

    const permissions = ref<Record<string, Permission[]>>({
        global: [
            { module: 'Attendance', view: true, create: true, edit: true, delete: false },
            { module: 'Leave Management', view: true, create: true, edit: true, delete: true },
            { module: 'Inventory', view: true, create: true, edit: false, delete: false },
        ]
    })
    const initialPermissions = ref(JSON.parse(JSON.stringify(permissions.value)))
    const isDirty = computed(() => {
        return JSON.stringify(permissions.value) !== JSON.stringify(initialPermissions.value)
    })

    const employees = ref([
        { id: 'EMP001', name: 'Sarah Miller', designation: 'Product Designer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', email: 'sarah.m@nebula.io' },
        { id: 'EMP002', name: 'Marcus Chen', designation: 'Fullstack Dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus', email: 'marcus.c@nebula.io' },
    ])

    const filteredEmployees = computed(() => {
        if (!employeeSearch.value) return []
        return employees.value.filter(e => e.name.toLowerCase().includes(employeeSearch.value.toLowerCase()))
    })

    const selectedEmployee = computed(() => employees.value.find(e => e.id === selectedEmployeeId.value))

    const currentPermissions = computed(() => {
        const key = selectedEmployeeId.value || 'global'
        return permissions.value[key] || permissions.value.global
    })

    function togglePermission(idx: number, field: keyof Omit<Permission, 'module'>) {
        const key = selectedEmployeeId.value || 'global'
        if (!permissions.value[key]) {
            permissions.value[key] = JSON.parse(JSON.stringify(permissions.value.global))
        }
        permissions.value[key][idx][field] = !permissions.value[key][idx][field]
    }

    async function saveSettings() {
        const toast = useToast()
        isSaving.value = true

        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            initialPermissions.value = JSON.parse(JSON.stringify(permissions.value))
            toast.add({ title: 'Changes Saved', color: 'success' })
        } catch (error) {
            toast.add({ title: 'Error', color: 'error' })
        } finally {
            isSaving.value = false
        }
    }

    const VISIBILITY_MAP: Record<string, string> = {
        policy: 'Policy',
        guideline: 'Guideline',
        faq: 'FAQ',
        form: 'Form',
        other: 'Other'
    }

    function normalizePolicy(doc: any) {
        const rawType = (doc?.doctype ?? doc?.docType ?? doc?.doc_type ?? 'other').toString()
        const docType = rawType.toLowerCase()
        return {
            id: String(doc.id ?? doc.document_id ?? doc.pk ?? Date.now()),
            name: doc.documentname ?? doc.document_name ?? doc.name ?? doc.title ?? 'Policy',
            link: doc.documentlink ?? doc.document_link ?? doc.link ?? doc.url ?? '',
            docType,
            visibility: VISIBILITY_MAP[docType] || 'Policy',
            date: doc.created_at
                ? new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
                : new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
            day: doc.created_at
                ? new Date(doc.created_at).toLocaleDateString('en-US', { weekday: 'long' })
                : new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            isApplied: doc.isapplied ?? doc.is_applied ?? doc.isApplied ?? false,
        }
    }

    async function fetchPolicyDocuments(params?: { search?: string; ordering?: string; page?: number }) {
        const toast = useToast()
        loadingPolicies.value = true
        policyError.value = null
        try {
            const response = await useApi<any>('/api/organizations/documents/', {
                method: 'GET',
                params,
                credentials: 'include',
            })
            const payload = response?.data ?? response
            const list = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.results)
                    ? payload.results
                    : Array.isArray(payload?.data)
                        ? payload.data
                        : []
            policies.value = list.map(normalizePolicy)
            return policies.value
        } catch (err: any) {
            policyError.value = extractErrorMessage(err, 'Failed to fetch policy documents')
            toast.add({ title: 'Error', description: policyError.value, color: 'error' })
            return []
        } finally {
            loadingPolicies.value = false
        }
    }

    async function createPolicyDocument(payload: { document_name: string; link: string; doc_type: string }) {
        const toast = useToast()
        policySaving.value = true
        policyError.value = null
        const DOCTYPE_API_MAP: Record<string, string> = {
            policy: 'Policy',
            guideline: 'Guideline',
            faq: 'FAQ',
            form: 'Form',
            other: 'Other'
        }
        try {
            const response = await useApi<any>('/api/organizations/documents/', {
                method: 'POST',
                body: {
                    documentname: payload.document_name,
                    documentlink: payload.link,
                    doctype: DOCTYPE_API_MAP[payload.doc_type] ?? payload.doc_type,
                },
                credentials: 'include',
            })
            const created = response?.data ?? response
            if (created) {
                policies.value = [normalizePolicy(created), ...policies.value]
            }
            return created
        } catch (err: any) {
            policyError.value = extractErrorMessage(err, 'Failed to create policy document')
            toast.add({ title: 'Error', description: policyError.value, color: 'error' })
            throw err
        } finally {
            policySaving.value = false
        }
    }

    async function updatePolicyDocument(id: string | number, payload: { document_name: string; link: string; doc_type: string }) {
        const toast = useToast()
        policySaving.value = true
        policyError.value = null
        const DOCTYPE_API_MAP: Record<string, string> = {
            policy: 'Policy',
            guideline: 'Guideline',
            faq: 'FAQ',
            form: 'Form',
            other: 'Other'
        }
        try {
            const response = await useApi<any>(`/api/organizations/documents/${id}/`, {
                method: 'PUT',
                body: {
                    documentname: payload.document_name,
                    documentlink: payload.link,
                    doctype: DOCTYPE_API_MAP[payload.doc_type] ?? payload.doc_type,
                },
                credentials: 'include'
            })
            const updated = response?.data ?? response
            if (updated) {
                const updatedItem = normalizePolicy(updated)
                const index = policies.value.findIndex(p => p.id === updatedItem.id)
                if (index !== -1) {
                    policies.value[index] = { ...policies.value[index], ...updatedItem }
                }
            }
            return updated
        } catch (err: any) {
            policyError.value = extractErrorMessage(err, 'Failed to update policy document')
            toast.add({ title: 'Error', description: policyError.value, color: 'error' })
            throw err
        } finally {
            policySaving.value = false
        }
    }

    async function deletePolicyDocument(id: string | number) {
        const toast = useToast()
        policyDeleting.value = true
        policyError.value = null
        try {
            await useApi(`/api/organizations/documents/${id}/`, {
                method: 'DELETE',
                credentials: 'include'
            })
            policies.value = policies.value.filter(p => p.id !== String(id))
            return true
        } catch (err: any) {
            policyError.value = extractErrorMessage(err, 'Failed to delete policy document')
            toast.add({ title: 'Error', description: policyError.value, color: 'error' })
            throw err
        } finally {
            policyDeleting.value = false
        }
    }

    async function applyPolicyDocument(id: string | number) {
        const toast = useToast()
        policyApplying.value = true
        policyError.value = null
        try {
            await useApi(`/api/organizations/documents/${id}/apply/`, {
                method: 'POST',
                credentials: 'include'
            })
            const target = policies.value.find(p => p.id === String(id))
            if (target) {
                target.isApplied = true
            }
            return true
        } catch (err: any) {
            policyError.value = extractErrorMessage(err, 'Failed to apply policy')
            toast.add({ title: 'Error', description: policyError.value, color: 'error' })
            throw err
        } finally {
            policyApplying.value = false
        }
    }

    async function unapplyPolicyDocument(id: string | number) {
        const toast = useToast()
        policyApplying.value = true
        policyError.value = null
        try {
            await useApi(`/api/organizations/documents/${id}/unapply/`, {
                method: 'POST',
                credentials: 'include'
            })
            const target = policies.value.find(p => p.id === String(id))
            if (target) {
                target.isApplied = false
            }
            return true
        } catch (err: any) {
            policyError.value = extractErrorMessage(err, 'Failed to unapply policy')
            toast.add({ title: 'Error', description: policyError.value, color: 'error' })
            throw err
        } finally {
            policyApplying.value = false
        }
    }

    return {
        activeMenu, uploadPolicyModalOpen, employeeSearch, selectedEmployeeId, isSaving, isDirty,
        policySaving, policyDeleting, policyApplying, policyError, policies, loadingPolicies,
        employees, filteredEmployees, selectedEmployee, currentPermissions,
        togglePermission, saveSettings,
        createPolicyDocument, updatePolicyDocument, deletePolicyDocument, fetchPolicyDocuments,
        applyPolicyDocument, unapplyPolicyDocument
    }
})
