export interface RoleDetail {
    id: number
    role: string
    description?: string
    can_view_all_employees: boolean
    can_create_employees: boolean
    can_edit_all_employees: boolean
    can_delete_employees: boolean
    can_view_subordinates: boolean
    can_approve_leave: boolean
    can_approve_timesheet: boolean
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface DepartmentDetail {
    id: number
    name: string
    code?: string
    description?: string
    manager?: number | null
    manager_name?: string
    is_active: boolean
    employee_count?: number
    designations?: DesignationDetail[]
    created_at?: string
    updated_at?: string
}

export interface DesignationDetail {
    id: number
    name: string
    department: number
    department_name: string
    level: number
    description?: string
    is_active: boolean
    created_at?: string
    updated_at?: string
}

export interface EmergencyContact {
    id: number
    name: string
    relationship: string
    phone: string
    alternate_phone?: string
    email?: string
    address?: string
    is_primary: boolean
    created_at: string
    updated_at: string
    created_by?: number | null
    updated_by?: number | null
}

export interface EmergencyContactCreate {
    name: string
    relationship: string
    phone: string
    alternate_phone?: string
    email?: string
    address?: string
    is_primary?: boolean
}

export interface Education {
    id: number
    level: string
    degree: string
    field_of_study: string
    institution: string
    start_date: string
    end_date?: string
    is_completed: boolean
    percentage?: string
    grade?: string
    description?: string
    certificate?: string | null
    created_at: string
    updated_at: string
    created_by?: number | null
    updated_by?: number | null
}

export interface WorkHistory {
    id: number
    company_name: string
    job_title: string
    department?: string
    start_date: string
    end_date?: string
    is_current: boolean
    job_description?: string
    achievements?: string
    reason_for_leaving?: string
    supervisor_name?: string
    supervisor_contact?: string
    salary?: number | null
    created_at: string
    updated_at: string
    created_by?: number | null
    updated_by?: number | null
}

export interface Employee {
    id: number
    employee_id: string
    user?: number | null

    full_name: string
    first_name: string
    middle_name?: string
    last_name: string

    email: string
    phone: string
    alternate_phone?: string

    date_of_birth?: string
    gender?: string
    marital_status?: string
    nationality?: string
    blood_group?: string

    // Address fields
    address_line1?: string
    address_line2?: string
    city?: string
    state?: string
    country?: string
    postal_code?: string

    address_line1_2?: string
    address_line2_2?: string
    city_2?: string
    state_2?: string
    country_2?: string
    postal_code_2?: string

    photo?: string
    photo_url?: string | null

    // Role
    role?: number
    role_detail?: RoleDetail

    // Department
    department?: number
    department_detail?: DepartmentDetail

    // Designation
    designation?: number
    designation_detail?: DesignationDetail

    // Manager
    reporting_manager?: number | null
    manager_detail?: Employee | null

    employee_type?: string
    employment_status?: string

    joining_date?: string
    probation_end_date?: string | null
    confirmation_date?: string | null

    work_location?: string

    // Identity documents
    pan_number?: string
    aadhar_number?: string
    passport_number?: string
    driving_license?: string

    // Bank details
    bank_name?: string
    account_number?: string
    ifsc_code?: string
    account_holder_name?: string

    // Related data
    emergency_contacts?: EmergencyContact[]
    educations?: Education[]
    work_histories?: WorkHistory[]

    // Integration
    slack_user_id?: string | null

    is_active: boolean
    created_at: string
    updated_at: string
}

export interface EmployeeListResponse {
    count: number;
    results: Employee[];
}

export interface EmployeeCreateUpdate {
    user?: number | null
    first_name: string
    middle_name?: string
    last_name: string
    date_of_birth?: string | null
    gender?: string
    marital_status?: string
    nationality?: string
    blood_group?: string
    photo?: string | null
    email: string
    phone: string
    alternate_phone?: string
    address_line1?: string
    address_line2?: string
    city?: string
    state?: string
    country?: string
    postal_code?: string
    address_line1_2?: string
    address_line2_2?: string
    city_2?: string
    state_2?: string
    country_2?: string
    postal_code_2?: string
    role?: number | null
    department: number
    designation: number
    reporting_manager?: number | null
    employee_type?: string
    employment_status?: string
    joining_date?: string | null
    probation_end_date?: string | null
    confirmation_date?: string | null
    work_location?: string
    pan_number?: string | null
    aadhar_number?: string | null
    passport_number?: string | null
    driving_license?: string | null
    bank_name?: string
    account_number?: string
    ifsc_code?: string
    account_holder_name?: string
    is_active?: boolean
    emergency_contacts?: EmergencyContactCreate[]
    documents?: EmployeeDocumentCreate[]
}

export interface EmployeeDocumentCreate {
    document_type: string
    document_name?: string
    document_url?: string
    public_id?: string
    resource_type?: string
}

export interface CreateEmployeeForm {
    first_name: string
    last_name: string
    department: number | undefined
    designation: string
    date_of_birth: string
    gender: string
    blood_group: string
    marital_status: string
    phone: string
    alternate_phone: string
    email: string
    address_line1: string
    address_line2: string
    city: string
    state: string
    country: string
    postal_code: string
    address_line1_2: string
    address_line2_2: string
    city_2: string
    state_2: string
    country_2: string
    postal_code_2: string
    emergency_contact_name: string
    emergency_contact_relationship: string
    emergency_phone: string
}
