export interface DepartmentDetail {
    id: number
    name: string
    code?: string
    description?: string
    manager?: number | null
    manager_name?: string
    is_active: boolean
}

export interface DesignationDetail {
    id: number
    name: string
    department: number
    department_name: string
    level: number
    description?: string
    is_active: boolean
}

export interface Employee {
    id: number
    employee_id: string
    user: number | null

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

    photo?: string | null

    department: number
    department_detail?: DepartmentDetail

    designation: number
    designation_detail?: DesignationDetail

    reporting_manager?: number | null
    manager_detail?: string

    employee_type?: string
    employment_status?: string

    joining_date?: string
    probation_end_date?: string
    confirmation_date?: string

    work_location?: string

    pan_number?: string
    aadhar_number?: string
    passport_number?: string
    driving_license?: string

    bank_name?: string
    account_number?: string
    ifsc_code?: string
    account_holder_name?: string

    emergency_contacts?: any[]
    educations?: any[]
    work_histories?: any[]

    is_active: boolean
    created_at: string
    updated_at: string
}

export interface EmployeeListResponse {
    count: number;
    results: Employee[];
}