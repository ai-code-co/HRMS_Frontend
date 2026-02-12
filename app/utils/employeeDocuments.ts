/** Shared document type options for employee documents (dropdowns, validation). */
export const DOCUMENT_TYPE_OPTIONS = [
    { label: 'CV', value: 'cv' },
    { label: 'PAN Card', value: 'pan_card' },
    { label: 'Address Proof', value: 'address_proof' },
    { label: 'Photo', value: 'photo' },
    { label: 'Qualification Certificate', value: 'qualification_cert' },
    { label: 'Offer Letter', value: 'offer_letter' },
    { label: 'Appointment Letter', value: 'appointment_letter' },
    { label: 'Previous Company Experience Letter', value: 'prev_exp_letter' },
    { label: 'Previous Company Offer Letter', value: 'prev_offer_letter' },
    { label: 'Previous Company Salary Slip', value: 'prev_salary_slip' },
    { label: 'Previous Company Other Documents', value: 'prev_other_docs' },
] as const

/** Document type values that are required for employees. */
export const REQUIRED_DOCUMENT_TYPES = [
    'cv',
    'pan_card',
    'address_proof',
    'photo',
    'qualification_cert',
] as const

export type DocumentTypeValue = (typeof DOCUMENT_TYPE_OPTIONS)[number]['value']

/** Normalize API or form value to a known document type value, or return as-is. */
export function normalizeDocumentType(value?: string): string {
    const normalized = String(value ?? '').trim()
    if (!normalized) return ''
    const direct = DOCUMENT_TYPE_OPTIONS.find(option => option.value === normalized)
    if (direct) return direct.value
    const byLabel = DOCUMENT_TYPE_OPTIONS.find(option => option.label.toLowerCase() === normalized.toLowerCase())
    return byLabel?.value ?? normalized
}

/** Get display label for a document type value. */
export function getDocumentLabel(value?: string): string {
    const normalized = normalizeDocumentType(value)
    return DOCUMENT_TYPE_OPTIONS.find(option => option.value === normalized)?.label ?? (value || 'Document')
}

/** Whether the given type is one of the required document types. */
export function isRequiredDocumentType(type: string): boolean {
    return (REQUIRED_DOCUMENT_TYPES as readonly string[]).includes(type)
}

/** Format file size for display. */
export function formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
