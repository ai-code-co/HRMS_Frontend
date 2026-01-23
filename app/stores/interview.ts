import { defineStore } from 'pinia'
import type {
    Job,
    JobPayload,
    CandidateListItem,
    CandidateDetail,
    Invite,
    InviteApi,
    InviteApiStatus,
    InvitePayload,
    InviteStatus
} from '~/types/interview'
import { extractErrorMessage } from '~/composables/useErrorMessage'

export const useInterviewStore = defineStore('interview', {
    state: () => ({
        jobs: [] as Job[],
        candidates: [] as CandidateListItem[],
        selectedCandidate: null as CandidateDetail | null,
        invites: [] as InviteApi[],
        loading: false,
        error: null as string | null,
    }),

    getters: {
        jobsList: (state) => state.jobs,
        candidatesList: (state) => state.candidates,
        invitesList: (state) => state.invites,
        isLoading: (state) => state.loading,

        openJobs: (state) => state.jobs.filter(j => j.status === 'open'),
        closedJobs: (state) => state.jobs.filter(j => j.status === 'closed'),

        jobsCount: (state) => state.jobs.length,
        candidatesCount: (state) => state.candidates.length,
        invitesCount: (state) => state.invites.length,

        pendingInvites: (state) => state.invites.filter(i => i.status === 'PENDING'),
    },

    actions: {
        // ============ JOBS API ============

        async fetchJobs(showGlobalLoader = false) {
            this.error = null
            const toast = useToast()
            const { showLoader, hideLoader } = useGlobalLoader()

            if (showGlobalLoader && import.meta.client) {
                showLoader()
            }

            try {
                const response = await useInterviewApi<Job[]>('/api/jobs')
                this.jobs = response
                return this.jobs
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch jobs')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                return []
            } finally {
                if (showGlobalLoader && import.meta.client) {
                    hideLoader()
                }
            }
        },

        async fetchJobById(jobId: string) {
            this.error = null
            const toast = useToast()

            try {
                const response = await useInterviewApi<Job>(`/api/jobs/${jobId}`)
                return response
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch job details')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                return null
            }
        },

        async createJob(payload: JobPayload) {
            this.loading = true
            this.error = null
            const toast = useToast()

            try {
                const response = await useInterviewApi<Job>('/api/jobs', {
                    method: 'POST',
                    body: payload
                })

                this.jobs.unshift(response)

                toast.add({
                    title: 'Success',
                    description: 'Job created successfully',
                    color: 'success'
                })

                return response
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to create job')
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

        async updateJob(jobId: string, payload: JobPayload) {
            this.loading = true
            this.error = null
            const toast = useToast()

            try {
                const response = await useInterviewApi<Job>(`/api/jobs/${jobId}`, {
                    method: 'PUT',
                    body: payload
                })

                const index = this.jobs.findIndex(j => j.id === jobId)
                if (index !== -1) {
                    this.jobs[index] = response
                }

                toast.add({
                    title: 'Success',
                    description: 'Job updated successfully',
                    color: 'success'
                })

                return response
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to update job')
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

        async deleteJob(jobId: string) {
            this.loading = true
            this.error = null
            const toast = useToast()

            try {
                await useInterviewApi(`/api/jobs/${jobId}`, {
                    method: 'DELETE'
                })

                this.jobs = this.jobs.filter(j => j.id !== jobId)

                toast.add({
                    title: 'Success',
                    description: 'Job deleted successfully',
                    color: 'success'
                })
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to delete job')
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

        // ============ CANDIDATES API ============

        async fetchCandidates(showGlobalLoader = false) {
            this.error = null
            const toast = useToast()
            const { showLoader, hideLoader } = useGlobalLoader()

            if (showGlobalLoader && import.meta.client) {
                showLoader()
            }

            try {
                const response = await useInterviewApi<CandidateListItem[]>('/api/candidates')
                this.candidates = response
                return this.candidates
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch candidates')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                return []
            } finally {
                if (showGlobalLoader && import.meta.client) {
                    hideLoader()
                }
            }
        },

        async fetchCandidateById(candidateId: string) {
            this.error = null
            const toast = useToast()

            try {
                const response = await useInterviewApi<CandidateDetail>(`/api/candidates/${candidateId}`)
                this.selectedCandidate = response
                return response
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch candidate details')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                return null
            }
        },

        clearSelectedCandidate() {
            this.selectedCandidate = null
        },

        // ============ INVITES ============

        async fetchInvites(showGlobalLoader = false) {
            this.error = null
            const toast = useToast()
            const { showLoader, hideLoader } = useGlobalLoader()

            if (showGlobalLoader && import.meta.client) {
                showLoader()
            }

            try {
                // Hardcoded user_id as per requirements
                const userId = '834a82fc-f116-4726-bcbb-5984fd113c3e'
                const response = await useInterviewApi<InviteApi[]>(`/api/invites?issued_by=${userId}`)
                this.invites = response
                return this.invites
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch invites')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                return []
            } finally {
                if (showGlobalLoader && import.meta.client) {
                    hideLoader()
                }
            }
        },

        async createInvite(payload: InvitePayload) {
            this.loading = true
            this.error = null
            const toast = useToast()

            try {
                // Send invites for each email
                const responses: InviteApi[] = []
                for (const email of payload.emails) {
                    const response = await useInterviewApi<InviteApi>('/api/invites', {
                        method: 'POST',
                        body: {
                            email,
                            issued_by: payload.issued_by
                        }
                    })
                    responses.push(response)
                }

                // Add all new invites to the list
                this.invites.unshift(...responses)

                toast.add({
                    title: 'Success',
                    description: `${responses.length} invite(s) sent successfully`,
                    color: 'success'
                })

                return responses
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to send invite')
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

        async updateInviteStatus(id: string, status: InviteApiStatus) {
            this.loading = true
            const toast = useToast()

            try {
                // TODO: Replace with actual API call when endpoint is available
                const invite = this.invites.find(i => i.id === id)
                if (invite) {
                    invite.status = status
                }

                toast.add({
                    title: 'Success',
                    description: 'Invite status updated',
                    color: 'success'
                })
            } catch (err: any) {
                toast.add({
                    title: 'Error',
                    description: 'Failed to update invite status',
                    color: 'error'
                })
            } finally {
                this.loading = false
            }
        },

        // ============ DATA SETTERS ============

        setInterviewData(jobs: Job[], candidates: CandidateListItem[], invites: InviteApi[]) {
            this.jobs = jobs
            this.candidates = candidates
            this.invites = invites
        },

        setJobs(jobs: Job[]) {
            this.jobs = jobs
        },

        setCandidates(candidates: CandidateListItem[]) {
            this.candidates = candidates
        }
    }
})
