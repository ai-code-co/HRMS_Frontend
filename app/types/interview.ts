export type JobStatus = 'open' | 'closed'
export type CandidateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEWING'
export type EvaluationRecommendation = 'STRONG_MATCH' | 'POTENTIAL_MATCH' | 'WEAK_MATCH'
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'PENDING' | 'USED'
export type InviteApiStatus = 'PENDING' | 'USED'

export type JobType = 'Remote' | 'Hybrid' | 'Onsite'

export interface Job {
    id: string
    title: string
    description: string
    status: JobStatus
    created_at: string
    openings?: number
    applicants?: number
    job_type?: JobType
    experience?: string
}

export interface JobPayload {
    title: string
    description: string
    status: JobStatus
    openings?: number
    applicants?: number
    job_type?: JobType
    experience?: string
}

// Candidate from list endpoint
export interface CandidateListItem {
    id: string
    name: string
    email: string
    phone: string | null
    created_at: string
    job: {
        id: string
        title: string
        description: string
    }
}

// Document attached to candidate
export interface CandidateDocument {
    id: string
    candidate_id: string
    storage_bucket: string
    storage_path: string
    file_hash: string
    uploaded_at: string
    url: string
}

// AI Evaluation of candidate
export interface CandidateEvaluation {
    id: string
    candidate_id: string
    score: number
    recommendation: EvaluationRecommendation
    matched_skills: Record<string, string>
    missing_skills: Record<string, string>
    strengths: Record<string, string>
    weaknesses: Record<string, string>
    summary: string
    status: string
    error_message: string | null
    created_at: string
    updated_at: string
}

// Interview details
export interface CandidateInterview {
    id: string
    candidate_id: string
    job_id: string
    status: string
    started_at: string | null
    completed_at: string | null
    duration: string | null
    access_token: string
    video_url: string | null
    transcript_url: string | null
}

// Full candidate details from detail endpoint
export interface CandidateDetail {
    id: string
    job_id: string
    name: string
    email: string
    phone: string | null
    created_at: string
    status: CandidateStatus
    status_updated_at: string | null
    status_updated_by: string | null
    jobs: Job
    job: {
        id: string
        title: string
        status: JobStatus
        created_at: string
        description: string
    }
    documents: CandidateDocument[]
    evaluation: CandidateEvaluation | null
    interview: CandidateInterview | null
}

// Legacy Invite interface (for backward compatibility)
export interface Invite {
    id: number
    candidate_id: number
    candidate_name: string
    candidate_email: string
    job_id: number
    job_title: string
    interview_date: string
    interview_time: string
    interview_type: 'in-person' | 'video' | 'phone'
    location?: string
    meeting_link?: string
    status: InviteStatus
    interviewer_name?: string
    notes?: string
    created_at: string
    updated_at: string
}

// API Invite interface (from /api/invites endpoint)
export interface InviteApi {
    id: string
    email: string
    status: InviteApiStatus
    created_at: string
    expires_at: string
    used_at: string | null
    has_applied: boolean
}

export interface InvitePayload {
    emails: string[]
    issued_by: string
}

export interface JobsResponse {
    error: number
    data: Job[]
}

export interface CandidatesResponse {
    error: number
    data: Candidate[]
}

export interface InvitesResponse {
    error: number
    data: Invite[]
}
