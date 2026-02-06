import { ofetch } from 'ofetch'

export interface InterviewApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: Record<string, any>
    params?: Record<string, any>
    headers?: Record<string, string>
}

export default async function useInterviewApi<T = any>(
    path: string,
    options: InterviewApiOptions = {}
): Promise<T> {
    const config = useRuntimeConfig()
    const baseURL = (config.public.interviewApiBase as string)
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    try {
        return await ofetch<T>(path, {
            baseURL,
            method: options.method ?? 'GET',
            headers,
            query: options.params,
            body: options.body,
            retry: 1,
        })
    } catch (err: any) {
        throw err
    }
}
